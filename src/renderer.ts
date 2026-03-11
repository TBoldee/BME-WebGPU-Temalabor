import quadVertWGSL from '../shaders/quad_vert.wgsl?raw';
import fragWGSL from '../shaders/frag.wgsl?raw';
import { quitIfWebGPUNotAvailableOrMissingFeatures } from '../util/util.ts';
import { Level, Rect } from './level.ts';

// per vertex: x, y, r, g, b, a  →  6 floats × 4 bytes = 24 bytes
const FLOATS_PER_VERTEX = 6;
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
        (py / sh) * -2 + 1,
    ];
    const [r, g, b, a] = color;
    const tl = toNDC(x,     y    );
    const tr = toNDC(x + w, y    );
    const br = toNDC(x + w, y + h);
    const bl = toNDC(x,     y + h);
    // prettier-ignore
    return new Float32Array([
        ...tl, r, g, b, a,  // 0: top-left
        ...tr, r, g, b, a,  // 1: top-right
        ...br, r, g, b, a,  // 2: bottom-right
        ...bl, r, g, b, a,  // 3: bottom-left
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

        const pipeline = device.createRenderPipeline({
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
        });

        const renderer = new Renderer(device, context, pipeline, canvas);
        renderer.resizeCanvas(canvas);
        new ResizeObserver(() => renderer.resizeCanvas(canvas)).observe(canvas);
        return renderer;
    }

    private resizeCanvas(canvas: HTMLCanvasElement): void {
        //const dpr     = window.devicePixelRatio;
        canvas.width  = canvas.clientWidth  //* dpr;
        canvas.height = canvas.clientHeight //* dpr;
    }

    render(level: Level): void {
        let rects: Rect[] = level.rects;
        rects.push(level.player); //player rendered as a rectangle
        rects = [level.background].concat(rects);
        const sw = this.canvas.width;
        const sh = this.canvas.height;

        const vertexData = new Float32Array(rects.length * VERTS_PER_QUAD * FLOATS_PER_VERTEX);
        const indexData  = new Uint16Array(rects.length * INDICES_PER_QUAD);

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
        passEncoder.setVertexBuffer(0, vertexBuffer);
        passEncoder.setIndexBuffer(indexBuffer, 'uint16');
        passEncoder.drawIndexed(rects.length * INDICES_PER_QUAD);
        passEncoder.end();

        this.device.queue.submit([commandEncoder.finish()]);

        vertexBuffer.destroy();
        indexBuffer.destroy();
    }
}
