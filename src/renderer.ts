import quadVertWGSL from '../shaders/quad_vert.wgsl?raw';
import fragWGSL from '../shaders/frag.wgsl?raw';
import texturedFragWGSL from '../shaders/textured_quad_frag.wgsl?raw';
import texturedQuadVertWGSL from '../shaders/textured_quad_vert.wgsl?raw';
import { quitIfWebGPUNotAvailableOrMissingFeatures } from '../util/util.ts';
import type { Level } from "./level.ts";
import type { Rect } from "./rect.ts";
import bricksUrl from './images/purplebrick.png';
import lavaUrl from './images/lava.png';
import doorUrl from './images/door.png';
import ghostUrl from './images/ghost.png';
import ghostLyingUrl from './images/ghostLying.png';
import bonesUrl from './images/bone.png';

type textureProps = {
    url: string;
    name: string;
    tilingX: number;
    tilingY: number;
}
const textureURLs:textureProps[] = [
    {url: bricksUrl, name: "bricks", tilingX: 64, tilingY: 64},
    {url: lavaUrl, name: "lava", tilingX:64, tilingY: 64},
    {url: doorUrl, name: "door", tilingX:32, tilingY: 64},
    {url: ghostUrl, name: "ghost", tilingX:24, tilingY: 64},
    {url: ghostLyingUrl, name: "ghostLying", tilingX:64, tilingY: 24},
    {url: bonesUrl, name: "bones", tilingX: 64, tilingY: 64},
];


// per vertex: x, y, u,v  →  4 floats × 4 bytes = 16 bytes
const texturedLayout = {
    floats_per_vertex: 4,
    bytes_per_vertex: 16,
    verts_per_quad: 4,
    indices_per_quad: 6,
    attributes: [
        { shaderLocation: 0, offset: 0,     format: 'float32x2' }, // pos
        { shaderLocation: 1, offset: 2 * 4, format: 'float32x2' }, // uv
    ] satisfies GPUVertexAttribute[],
}

// per vertex: x, y, r, g, b, a →  6 floats × 4 bytes = 24 bytes
const coloredLayout = {
    floats_per_vertex: 6,
    bytes_per_vertex: 24,
    verts_per_quad: 4,
    indices_per_quad: 6,
    attributes: [
        { shaderLocation: 0, offset: 0,     format: 'float32x2' }, // pos
        { shaderLocation: 1, offset: 2 * 4, format: 'float32x4' }, // rgba
    ] satisfies GPUVertexAttribute[],
}

const BASE_INDICES = [0, 1, 2, 0, 2, 3];

function rectToVertices(
    x: number, y: number, w: number, h: number,
    sw: number, sh: number,
    color?: number[], texture?: string,
): Float32Array {

    const toNDC = (px: number, py: number): [number, number] => [
        (px / sw) *  2 - 1,
        (py / sh) * -2 + 1, //Y-axis in clip space is +1 at the top and -1 at bottom, while pixel position is 0 at top and grows downwards. Calculation needs to be inverted.
    ];
    const tl = toNDC(x,     y    );
    const tr = toNDC(x + w, y    );
    const br = toNDC(x + w, y + h);
    const bl = toNDC(x,     y + h);

    let vertexArray = new Float32Array([]);
    let tilingX, tilingY, u, v, r, g, b, a;
    if (texture) {
        const textureProps = textureURLs.find(t => t.name === texture);
        tilingX = textureProps.tilingX;
        tilingY = textureProps.tilingY;
        u = w / tilingX;
        v = h / tilingY;
        vertexArray = new Float32Array([
            ...tl, 0,0,
            ...tr, u,0,
            ...br, u,v,
            ...bl, 0,v,
        ]);
    } else if (color){
        [r,g,b,a] = color;
        vertexArray = new Float32Array([
            ...tl, r,g,b,a,
            ...tr, r,g,b,a,
            ...br, r,g,b,a,
            ...bl, r,g,b,a,
        ])
    }

    return vertexArray;
}

export class Renderer {
    private device: GPUDevice;
    private context: GPUCanvasContext;
    private texturedPipeline: GPURenderPipeline;
    private coloredPipeline: GPURenderPipeline;
    private canvas: HTMLCanvasElement;
    private bindGroups: GPUBindGroup[];

    private constructor(
        device: GPUDevice,
        context: GPUCanvasContext,
        texturedPipeline: GPURenderPipeline,
        coloredPipeline: GPURenderPipeline,
        canvas: HTMLCanvasElement,
        bindGroups: GPUBindGroup[],
    ) {
        this.device   = device;
        this.context  = context;
        this.texturedPipeline = texturedPipeline;
        this.coloredPipeline = coloredPipeline;
        this.canvas   = canvas;
        this.bindGroups = bindGroups;
    }

    static async init(canvas: HTMLCanvasElement): Promise<Renderer> {
        const adapter = await navigator.gpu?.requestAdapter({ featureLevel: 'compatibility' });
        const device  = await adapter?.requestDevice();
        quitIfWebGPUNotAvailableOrMissingFeatures(adapter, device);

        const context = canvas.getContext('webgpu') as GPUCanvasContext;
        const presentationFormat = navigator.gpu.getPreferredCanvasFormat();
        context.configure({ device, format: presentationFormat });

        const coloredPipeline = Renderer.createPipelineFromLayout(device, quadVertWGSL, fragWGSL, coloredLayout.bytes_per_vertex, coloredLayout.attributes);
        const texturedPipeline = Renderer.createPipelineFromLayout(device, texturedQuadVertWGSL, texturedFragWGSL, texturedLayout.bytes_per_vertex, texturedLayout.attributes);

        const sampler = device.createSampler({
            addressModeU: 'repeat',
            addressModeV: 'repeat',
            magFilter: 'linear',
            minFilter: 'linear',
        });

        const bindGroups: GPUBindGroup[] = [];
        for (const txtr of textureURLs) {
            const source = await Renderer.loadImageBitmap(txtr.url);
            const texture = device.createTexture({
                label: txtr.url,
                format: 'rgba8unorm',
                size: [source.width, source.height],
                usage: GPUTextureUsage.TEXTURE_BINDING |
                    GPUTextureUsage.COPY_DST |
                    GPUTextureUsage.RENDER_ATTACHMENT,
            });

            device.queue.copyExternalImageToTexture(
                { source, flipY: false },
                { texture: texture },
                { width: source.width, height: source.height },
            );

            bindGroups.push(
                device.createBindGroup({
                    layout: texturedPipeline.getBindGroupLayout(0),
                    entries: [
                        { binding: 0, resource: sampler },
                        { binding: 1, resource: texture.createView() },
                    ]
                })
            );
        }

        const renderer = new Renderer(device, context, texturedPipeline, coloredPipeline, canvas, bindGroups);
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
        let texturedRects: Rect[] = rects.filter(r => r.texture);
        let coloredRects: Rect[] = rects.filter(r => !r.texture);

        const texturedVertexData = new Float32Array(texturedRects.length * texturedLayout.verts_per_quad * texturedLayout.floats_per_vertex);
        const coloredVertexData = new Float32Array(coloredRects.length * coloredLayout.verts_per_quad * coloredLayout.floats_per_vertex);
        const indexData  = new Uint16Array(rects.length * texturedLayout.indices_per_quad);

        let texturedOffset = 0;
        let coloredOffset = 0;
        for (let i = 0; i < rects.length; i++) {
            const { x, y, w, h, color = [1, 1, 1, 1], texture } = rects[i];
            if (rects[i].texture){
                texturedVertexData.set(rectToVertices(x, y, w, h, sw, sh, color, texture), texturedOffset);
                texturedOffset += texturedLayout.verts_per_quad * texturedLayout.floats_per_vertex;
            } else {
                coloredVertexData.set(rectToVertices(x, y, w, h, sw, sh, color, texture), coloredOffset);
                coloredOffset += coloredLayout.verts_per_quad * coloredLayout.floats_per_vertex;
            }
            const base = i * texturedLayout.verts_per_quad;
            for (let j = 0; j < texturedLayout.indices_per_quad; j++) {
                indexData[i * texturedLayout.indices_per_quad + j] = BASE_INDICES[j] + base;
            }
        }

        let coloredVertexBuffer: GPUBuffer;
        if (coloredVertexData.length > 0) {
            coloredVertexBuffer = this.device.createBuffer({
                size:  coloredVertexData.byteLength,
                usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
            });
            this.device.queue.writeBuffer(coloredVertexBuffer, 0, coloredVertexData);
        }

        let texturedVertexBuffer: GPUBuffer;
        if (texturedVertexData.length > 0) {
            texturedVertexBuffer = this.device.createBuffer({
                size:  texturedVertexData.byteLength,
                usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
            });
            this.device.queue.writeBuffer(texturedVertexBuffer, 0, texturedVertexData);
        }

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

        texturedOffset = 0;
        coloredOffset = 0;
        for (let i = 0; i < rects.length; i++) {
            const rect: Rect = rects[i];
            if (rect.texture) {
                passEncoder.setPipeline(this.texturedPipeline);
                passEncoder.setBindGroup(0, this.getBindGroupForTexture(rect.texture!));
                passEncoder.setVertexBuffer(0, texturedVertexBuffer, texturedOffset);
                texturedOffset += texturedLayout.verts_per_quad * texturedLayout.bytes_per_vertex;
            } else {
                passEncoder.setPipeline(this.coloredPipeline);
                passEncoder.setVertexBuffer(0, coloredVertexBuffer, coloredOffset);
                coloredOffset += coloredLayout.verts_per_quad * coloredLayout.bytes_per_vertex;
            }
            passEncoder.setIndexBuffer(indexBuffer, 'uint16');
            passEncoder.drawIndexed(6);
        }

        passEncoder.end();

        this.device.queue.submit([commandEncoder.finish()]);

        texturedVertexBuffer?.destroy();
        coloredVertexBuffer?.destroy();
        indexBuffer.destroy();
    }

    static async loadImageBitmap(url: string) {
        const res = await fetch(url);
        const blob = await res.blob();
        return await createImageBitmap(blob, { colorSpaceConversion: 'none' });
    }

    private getBindGroupForTexture(texture: string): GPUBindGroup{
        switch (texture) {
            case "bricks":
                return this.bindGroups[0];
            case "lava":
                return this.bindGroups[1];
            case "door":
                return this.bindGroups[2];
            case "ghost":
                return this.bindGroups[3];
            case "ghostLying":
                return this.bindGroups[4];
            case "bones":
                return this.bindGroups[5];
        }
    }

    private static createPipelineFromLayout (device: GPUDevice, vertShader: string, fragmentShader: string, vertexBufferStride: number, attributes: Iterable<GPUVertexAttribute>)
    :GPURenderPipeline {
        const presentationFormat = navigator.gpu.getPreferredCanvasFormat();
        return device.createRenderPipeline({
            layout: 'auto',
            vertex: {
                module: device.createShaderModule({ code: vertShader }),
                buffers: [{
                    arrayStride: vertexBufferStride,
                    attributes: [...attributes],
                }],
            },
            fragment: {
                module: device.createShaderModule({ code: fragmentShader }),
                targets: [{
                    format: presentationFormat,
                    blend: {
                        color: {
                            srcFactor: 'src-alpha',
                            dstFactor: 'one-minus-src-alpha',
                            operation: 'add',
                        },
                        alpha: {
                            srcFactor: 'one',
                            dstFactor: 'one-minus-src-alpha',
                            operation: 'add',
                        },
                    },
                }]
            },
            primitive: { topology: 'triangle-list' },
        });
    }
}
