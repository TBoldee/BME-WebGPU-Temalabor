import triangleVertWGSL from '../shaders/triangle_vert.wgsl?raw';
import fragWGSL from '../shaders/frag.wgsl?raw';
import { quitIfWebGPUNotAvailableOrMissingFeatures } from '../util/util.ts';

export class Renderer {
    private device: GPUDevice;
    private context: GPUCanvasContext;
    private pipeline: GPURenderPipeline;

    private constructor(
        device: GPUDevice,
        context: GPUCanvasContext,
        pipeline: GPURenderPipeline,
    ) {
        this.device = device;
        this.context = context;
        this.pipeline = pipeline;
    }

    static async init(canvas: HTMLCanvasElement): Promise<Renderer> {
        const adapter = await navigator.gpu?.requestAdapter({
            featureLevel: 'compatibility',
        });
        const device = await adapter?.requestDevice();
        quitIfWebGPUNotAvailableOrMissingFeatures(adapter, device);

        const context = canvas.getContext('webgpu') as GPUCanvasContext;
        const presentationFormat = navigator.gpu.getPreferredCanvasFormat();

        const renderer = new Renderer(
            device,
            context,
            null!, // pipeline set below
        );

        renderer.resizeCanvas(canvas);

        context.configure({ device, format: presentationFormat });

        renderer.pipeline = device.createRenderPipeline({
            layout: 'auto',
            vertex: {
                module: device.createShaderModule({ code: triangleVertWGSL }),
            },
            fragment: {
                module: device.createShaderModule({ code: fragWGSL }),
                targets: [{ format: presentationFormat }],
            },
            primitive: { topology: 'triangle-list' },
        });

        const resizeObserver = new ResizeObserver(() => renderer.resizeCanvas(canvas));
        resizeObserver.observe(canvas);

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

        const renderPassDescriptor: GPURenderPassDescriptor = {
            colorAttachments: [
                {
                    view: textureView,
                    clearValue: [0, 0, 0, 1],
                    loadOp: 'clear',
                    storeOp: 'store',
                },
            ],
        };

        const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);
        passEncoder.setPipeline(this.pipeline);
        passEncoder.draw(3);
        passEncoder.end();

        this.device.queue.submit([commandEncoder.finish()]);
    }
}




