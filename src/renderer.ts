import quadVertWGSL from '../shaders/quad_vert.wgsl?raw';
import fragWGSL from '../shaders/frag.wgsl?raw';
import texturedFragWGSL from '../shaders/textured_quad_frag.wgsl?raw';
import texturedQuadVertWGSL from '../shaders/textured_quad_vert.wgsl?raw';
import { quitIfWebGPUNotAvailableOrMissingFeatures } from '../util/util.ts';
import type { Level } from "./level.ts";
import type { Rect } from "./rect.ts";
import bricksUrl from './images/bricks.png';


// per vertex: x, y, u,v  →  4 floats × 4 bytes = 16 bytes
const FLOATS_PER_VERTEX = 4;
const BYTES_PER_VERTEX  = FLOATS_PER_VERTEX * 4;
const VERTS_PER_QUAD    = 4;
const INDICES_PER_QUAD  = 6;

const BASE_INDICES = [0, 1, 2, 0, 2, 3];

function rectToVertices(
    x: number, y: number, w: number, h: number,
    sw: number, sh: number,
    color: number[]
): Float32Array {
    const toNDC = (px: number, py: number): [number, number] => [
        (px / sw) *  2 - 1,
        (py / sh) * -2 + 1, //Y axis in clip space is +1 at the top and -1 at bottom, while pixel position is 0 at top and grows downwards. Calculation needs to be inverted.
    ];
    const tiling = 100;
    const [r, g, b, a] = color;
    const u = w / tiling;
    const v = h / tiling;
    const tl = toNDC(x,     y    );
    const tr = toNDC(x + w, y    );
    const br = toNDC(x + w, y + h);
    const bl = toNDC(x,     y + h);

    return new Float32Array([
        ...tl, 0, 0,  // 0: top-left
        ...tr, u, 0,  // 1: top-right
        ...br, u, v,  // 2: bottom-right
        ...bl, 0, v,  // 3: bottom-left
    ]);
}

export class Renderer {
    private device: GPUDevice;
    private context: GPUCanvasContext;
    private pipeline: GPURenderPipeline;
    private canvas: HTMLCanvasElement;

    private constructor(
        device: GPUDevice,
        context: GPUCanvasContext,
        pipeline: GPURenderPipeline,
        canvas: HTMLCanvasElement,
    ) {
        this.device   = device;
        this.context  = context;
        this.pipeline = pipeline;
        this.canvas   = canvas;
    }

    static async init(canvas: HTMLCanvasElement): Promise<Renderer> {
        const adapter = await navigator.gpu?.requestAdapter({ featureLevel: 'compatibility' });
        const device  = await adapter?.requestDevice();
        quitIfWebGPUNotAvailableOrMissingFeatures(adapter, device);

        const context = canvas.getContext('webgpu') as GPUCanvasContext;
        const presentationFormat = navigator.gpu.getPreferredCanvasFormat();
        context.configure({ device, format: presentationFormat });

        /*const pipeline = device.createRenderPipeline({
            layout: 'auto',
            vertex: {
                module: device.createShaderModule({ code: quadVertWGSL }),
                buffers: [{
                    arrayStride: BYTES_PER_VERTEX,
                    attributes: [
                        { shaderLocation: 0, offset: 0,     format: 'float32x2' }, // pos
                        { shaderLocation: 1, offset: 2 * 4, format: 'float32x4' }, // color
                    ],
                }],
            },
            fragment: {
                module: device.createShaderModule({ code: fragWGSL }),
                targets: [{ format: presentationFormat }],
            },
            primitive: { topology: 'triangle-list' },
        });*/

        const pipeline2 = device.createRenderPipeline({
            layout: 'auto',
            vertex: {
                module: device.createShaderModule({ code: texturedQuadVertWGSL }),
                buffers: [{
                    arrayStride: BYTES_PER_VERTEX,
                    attributes: [
                        { shaderLocation: 0, offset: 0,     format: 'float32x2' }, // pos
                        { shaderLocation: 1, offset: 2 * 4, format: 'float32x2' }, // uv
                    ],
                }],
            },
            fragment: {
                module: device.createShaderModule({ code: texturedFragWGSL }),
                targets: [{ format: presentationFormat }],
            },
            primitive: { topology: 'triangle-list' },
        });

        const renderer = new Renderer(device, context, pipeline2, canvas);
        renderer.resizeCanvas(canvas);
        new ResizeObserver(() => renderer.resizeCanvas(canvas)).observe(canvas);
        return renderer;
    }

    private resizeCanvas(canvas: HTMLCanvasElement): void {
        //const dpr     = window.devicePixelRatio;
        canvas.width  = canvas.clientWidth  //* dpr;
        canvas.height = canvas.clientHeight //* dpr;
    }

    async render(level: Level): Promise<void> {
        let rects: Rect[] = level.getRectsToRender();
        const sw = this.canvas.width;
        const sh = this.canvas.height;

        const vertexData = new Float32Array(rects.length * VERTS_PER_QUAD * FLOATS_PER_VERTEX);
        const indexData  = new Uint16Array(rects.length * INDICES_PER_QUAD);

        //const url = 'https://webgpufundamentals.org/webgpu/resources/images/f-texture.png';
        const source = await Renderer.loadImageBitmap(bricksUrl);
        const texture = this.device.createTexture({
            label: bricksUrl,
            format: 'rgba8unorm',
            size: [source.width, source.height],
            usage: GPUTextureUsage.TEXTURE_BINDING |
                GPUTextureUsage.COPY_DST |
                GPUTextureUsage.RENDER_ATTACHMENT,
        });

        this.device.queue.copyExternalImageToTexture(
            { source, flipY: true },
            { texture },
            { width: source.width, height: source.height },
        );

        const sampler = this.device.createSampler({
            addressModeU: 'repeat',
            addressModeV: 'repeat',
            magFilter: 'linear',
            minFilter: 'linear',
        });

        const bindGroup = this.device.createBindGroup({
            layout: this.pipeline.getBindGroupLayout(0),
            entries: [
                { binding: 0, resource: sampler },
                { binding: 1, resource: texture.createView() },
            ]
        });

        for (let i = 0; i < rects.length; i++) {
            const { x, y, w, h, color = [1, 1, 1, 1] } = rects[i];
            vertexData.set(rectToVertices(x, y, w, h, sw, sh, color), i * VERTS_PER_QUAD * FLOATS_PER_VERTEX);
            const base = i * VERTS_PER_QUAD;
            for (let j = 0; j < INDICES_PER_QUAD; j++) {
                indexData[i * INDICES_PER_QUAD + j] = BASE_INDICES[j] + base;
            }
        }

        const vertexBuffer = this.device.createBuffer({
            size:  vertexData.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
        });
        this.device.queue.writeBuffer(vertexBuffer, 0, vertexData);

        const indexBuffer = this.device.createBuffer({
            size:  indexData.byteLength,
            usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
        });
        this.device.queue.writeBuffer(indexBuffer, 0, indexData);

        const commandEncoder = this.device.createCommandEncoder();
        const passEncoder = commandEncoder.beginRenderPass({
            colorAttachments: [{
                view:       this.context.getCurrentTexture().createView(),
                clearValue: [0, 0, 0, 1],
                loadOp:     'clear',
                storeOp:    'store',
            }],
        });

        passEncoder.setPipeline(this.pipeline);
        passEncoder.setBindGroup(0, bindGroup);
        passEncoder.setVertexBuffer(0, vertexBuffer);
        passEncoder.setIndexBuffer(indexBuffer, 'uint16');
        passEncoder.drawIndexed(rects.length * INDICES_PER_QUAD);
        passEncoder.end();

        this.device.queue.submit([commandEncoder.finish()]);

        vertexBuffer.destroy();
        indexBuffer.destroy();
    }

    static async loadImageBitmap(url: string) {
        const res = await fetch(url);
        const blob = await res.blob();
        return await createImageBitmap(blob, { colorSpaceConversion: 'none' });
    }
}
