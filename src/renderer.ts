import quadVertWGSL from '../shaders/quad_vert.wgsl?raw';
import fragWGSL from '../shaders/frag.wgsl?raw';
import { quitIfWebGPUNotAvailableOrMissingFeatures } from '../util/util.ts';

const QUAD_VERTICES = new Float32Array([
    -0.5, -0.5,  // 0: bottom-left
     0.5, -0.5,  // 1: bottom-right
     0.5,  0.5,  // 2: top-right
    -0.5,  0.5,  // 3: top-left
]);

const QUAD_INDICES = new Uint16Array([
    0, 1, 2,  // triangle 1
    0, 2, 3,  // triangle 2
]);

export class Renderer {
    private device: GPUDevice;
    private context: GPUCanvasContext;
    private pipeline: GPURenderPipeline;
    private vertexBuffer: GPUBuffer;
    private indexBuffer: GPUBuffer;

    private constructor(
        device: GPUDevice,
        context: GPUCanvasContext,
        pipeline: GPURenderPipeline,
        vertexBuffer: GPUBuffer,
        indexBuffer: GPUBuffer,
    ) {
        this.device = device;
        this.context = context;
        this.pipeline = pipeline;
        this.vertexBuffer = vertexBuffer;
        this.indexBuffer = indexBuffer;
    }

    static async init(canvas: HTMLCanvasElement): Promise<Renderer> {
        const adapter = await navigator.gpu?.requestAdapter({ featureLevel: 'compatibility' });
        const device = await adapter?.requestDevice();
        quitIfWebGPUNotAvailableOrMissingFeatures(adapter, device);

        const context = canvas.getContext('webgpu') as GPUCanvasContext;
        const presentationFormat = navigator.gpu.getPreferredCanvasFormat();
        context.configure({ device, format: presentationFormat });

        const pipeline = device.createRenderPipeline({
            layout: 'auto',
            vertex: {
                module: device.createShaderModule({ code: quadVertWGSL }),
                buffers: [{
                    arrayStride: 2 * 4, // 2 floats × 4 bytes
                    attributes: [{ shaderLocation: 0, offset: 0, format: 'float32x2' }],
                }],
            },
            fragment: {
                module: device.createShaderModule({ code: fragWGSL }),
                targets: [{ format: presentationFormat }],
            },
            primitive: { topology: 'triangle-list' },
        });

        const vertexBuffer = device.createBuffer({
            size: QUAD_VERTICES.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
        });
        device.queue.writeBuffer(vertexBuffer, 0, QUAD_VERTICES);

        const indexBuffer = device.createBuffer({
            size: QUAD_INDICES.byteLength,
            usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
        });
        device.queue.writeBuffer(indexBuffer, 0, QUAD_INDICES);

        const renderer = new Renderer(device, context, pipeline, vertexBuffer, indexBuffer);
        renderer.resizeCanvas(canvas);
        new ResizeObserver(() => renderer.resizeCanvas(canvas)).observe(canvas);
        return renderer;
    }

    private resizeCanvas(canvas: HTMLCanvasElement): void {
        const dpr = window.devicePixelRatio;
        canvas.width = canvas.clientWidth * dpr;
        canvas.height = canvas.clientHeight * dpr;
    }

    render(): void {
        const commandEncoder = this.device.createCommandEncoder();
        const textureView = this.context.getCurrentTexture().createView();

        const passEncoder = commandEncoder.beginRenderPass({
            colorAttachments: [{
                view: textureView,
                clearValue: [0, 0, 0, 1],
                loadOp: 'clear',
                storeOp: 'store',
            }],
        });

        passEncoder.setPipeline(this.pipeline);
        passEncoder.setVertexBuffer(0, this.vertexBuffer);
        passEncoder.setIndexBuffer(this.indexBuffer, 'uint16');
        passEncoder.drawIndexed(6); // 6 indices, 4 unique vertices
        passEncoder.end();

        this.device.queue.submit([commandEncoder.finish()]);
    }
}
