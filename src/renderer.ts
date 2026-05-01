import quadVertWGSL from '../shaders/quad_vert.wgsl?raw';
import fragWGSL from '../shaders/frag.wgsl?raw';
import texturedFragWGSL from '../shaders/textured_quad_frag.wgsl?raw';
import texturedQuadVertWGSL from '../shaders/textured_quad_vert.wgsl?raw';
import { quitIfWebGPUNotAvailableOrMissingFeatures } from '../util/util.ts';
import { Level } from "./level.ts";
import type { Rect } from "./rect.ts";
import bricksUrl from './images/purplebrick.png';
import lavaUrl from './images/lava.png';
import doorUrl from './images/door.png';
import ghostUrl from './images/ghost.png';
import ghostLyingUrl from './images/ghostLying.png';
import bonesUrl from './images/bone.png';
import demonUrl from './images/demonhead.png'

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
    {url: demonUrl, name: "demon", tilingX: 64, tilingY: 64},
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

//const BASE_INDICES = [0, 1, 2, 0, 2, 3];

function rectToVertices(
    x: number, y: number, w: number, h: number, facing: "left" | "right",
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
        if (facing === "right"){
            vertexArray = new Float32Array([
                ...tl, 0,0,
                ...tr, u,0,
                ...br, u,v,
                ...bl, 0,v,
            ]);
        } else if (facing === "left"){
            vertexArray = new Float32Array([
                ...tl, u,0,
                ...tr, 0,0,
                ...br, 0,v,
                ...bl, u,v,
            ]);
        }

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
    private staticTexturedVertexBuffer: GPUBuffer
    private staticColoredVertexBuffer: GPUBuffer
    private dynamicTexturedVertexBuffer: GPUBuffer
    private indexBuffer: GPUBuffer
    private staticTexturedVertexData: Float32Array
    private staticColoredVertexData: Float32Array
    private dynamicTexturedVertexData: Float32Array

    private constructor(
        device: GPUDevice,
        context: GPUCanvasContext,
        texturedPipeline: GPURenderPipeline,
        coloredPipeline: GPURenderPipeline,
        canvas: HTMLCanvasElement,
        bindGroups: GPUBindGroup[],
        indexBuffer: GPUBuffer,
    ) {
        this.device = device;
        this.context = context;
        this.texturedPipeline = texturedPipeline;
        this.coloredPipeline = coloredPipeline;
        this.canvas = canvas;
        this.bindGroups = bindGroups;
        this.indexBuffer = indexBuffer;
    }

    static async init(canvas: HTMLCanvasElement): Promise<Renderer> {
        const adapter = await navigator.gpu?.requestAdapter({ featureLevel: 'compatibility' });
        const device  = await adapter?.requestDevice();
        quitIfWebGPUNotAvailableOrMissingFeatures(adapter, device);

        const context = canvas.getContext('webgpu') as GPUCanvasContext;
        const presentationFormat = navigator.gpu.getPreferredCanvasFormat();
        context.configure({ device, format: presentationFormat });

        const coloredPipeline = Renderer.createPipelineFromLayout(device, quadVertWGSL, fragWGSL, coloredLayout.bytes_per_vertex, coloredLayout.attributes, "coloredPipeline");
        const texturedPipeline = Renderer.createPipelineFromLayout(device, texturedQuadVertWGSL, texturedFragWGSL, texturedLayout.bytes_per_vertex, texturedLayout.attributes, "texturedPipeline");

        const indexData = new Uint16Array([0,1,2,0,2,3]);
        const indexBuffer = device.createBuffer({
            size:  indexData.byteLength,
            usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
        });
        device.queue.writeBuffer(indexBuffer, 0, indexData);

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

        const renderer = new Renderer(device, context, texturedPipeline, coloredPipeline, canvas, bindGroups, indexBuffer);
        renderer.resizeCanvas(canvas);
        new ResizeObserver(() => renderer.resizeCanvas(canvas)).observe(canvas);
        return renderer;
    }

    private resizeCanvas(canvas: HTMLCanvasElement): void {
        canvas.width  = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
    }

    rebuildStaticBuffers(rects: Rect[]) {
        const sw = this.canvas.width;
        const sh = this.canvas.height;
        let texturedRects: Rect[] = rects.filter(r => r.texture);
        let coloredRects: Rect[] = rects.filter(r => !r.texture);

        this.staticTexturedVertexData = new Float32Array(texturedRects.length * texturedLayout.verts_per_quad * texturedLayout.floats_per_vertex);
        this.staticColoredVertexData = new Float32Array(coloredRects.length * coloredLayout.verts_per_quad * coloredLayout.floats_per_vertex);

        let texturedOffset = 0;
        let coloredOffset = 0;
        for (let i = 0; i < rects.length; i++) {
            const { x, y, w, h, facing, color = [1, 1, 1, 1], texture } = rects[i];
            if (rects[i].texture){
                this.staticTexturedVertexData.set(rectToVertices(x, y, w, h, facing, sw, sh, color, texture), texturedOffset);
                texturedOffset += texturedLayout.verts_per_quad * texturedLayout.floats_per_vertex;
            } else {
                this.staticColoredVertexData.set(rectToVertices(x, y, w, h, facing, sw, sh, color, texture), coloredOffset);
                coloredOffset += coloredLayout.verts_per_quad * coloredLayout.floats_per_vertex;
            }
        }

        this.staticColoredVertexBuffer = this.rebuildBuffer(this.staticColoredVertexData, "staticColoredVertexBuffer");
        this.staticTexturedVertexBuffer = this.rebuildBuffer(this.staticTexturedVertexData, "staticTexturedVertexBuffer");
    }

    rebuildDynamicTexturedBuffers(rects: Rect[]) {
        this.calculateDynamicTexturedData(rects);
        this.dynamicTexturedVertexBuffer = this.rebuildBuffer(this.dynamicTexturedVertexData, "dynamicTexturedVertexBuffer");
    }

    rebuildBuffer(vertexData: Float32Array, label: string): GPUBuffer {
        let vertexBuffer: GPUBuffer;
        vertexBuffer = this.device.createBuffer({
            label: label,
            size:  vertexData.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
        });
        this.writeBuffer(vertexBuffer, vertexData as Float32Array<ArrayBuffer> );
        return vertexBuffer;
    }

    writeBuffer(buffer: GPUBuffer, data: Float32Array): void {
        this.device.queue.writeBuffer(buffer, 0, data as Float32Array<ArrayBuffer>);
    }

    calculateDynamicTexturedData(rects: Rect[]) {
        const sw = this.canvas.width;
        const sh = this.canvas.height;

        this.dynamicTexturedVertexData = new Float32Array(rects.length * texturedLayout.verts_per_quad * texturedLayout.floats_per_vertex);

        let offset = 0;
        for (let i = 0; i < rects.length; i++) {
            const { x, y, w, h, facing, color = [1, 1, 1, 1], texture } = rects[i];
            this.dynamicTexturedVertexData.set(rectToVertices(x, y, w, h, facing, sw, sh, color, texture), offset);
            offset += texturedLayout.verts_per_quad * texturedLayout.floats_per_vertex;
        }
    }

    async render(level: Level): Promise<void> {
        let staticRects: Rect[] = level.getStaticRectsToRender();
        let dynamicRects: Rect[] = level.getDynamicRectsToRender();

        if(Level.levelChanged){
            this.rebuildStaticBuffers(staticRects);
            this.rebuildDynamicTexturedBuffers(dynamicRects);
            Level.levelChanged = false;
        }
        this.calculateDynamicTexturedData(dynamicRects);
        this.writeBuffer(this.dynamicTexturedVertexBuffer,this.dynamicTexturedVertexData);

        const commandEncoder = this.device.createCommandEncoder();
        const passEncoder = commandEncoder.beginRenderPass({
            colorAttachments: [{
                view:       this.context.getCurrentTexture().createView(),
                clearValue: [0, 0, 0, 1],
                loadOp:     'clear',
                storeOp:    'store',
            }],
        });
        passEncoder.setIndexBuffer(this.indexBuffer, 'uint16');

        let staticTexturedOffset = 0;
        let staticColoredOffset = 0;
        for (let i = 0; i < staticRects.length; i++) {
            const rect: Rect = staticRects[i];
            if (rect.texture) {
                passEncoder.setPipeline(this.texturedPipeline);
                passEncoder.setBindGroup(0, this.getBindGroupForTexture(rect.texture!));
                passEncoder.setVertexBuffer(0, this.staticTexturedVertexBuffer, staticTexturedOffset);
                staticTexturedOffset += texturedLayout.verts_per_quad * texturedLayout.bytes_per_vertex;
            } else {
                passEncoder.setPipeline(this.coloredPipeline);
                passEncoder.setVertexBuffer(0, this.staticColoredVertexBuffer, staticColoredOffset);
                staticColoredOffset += coloredLayout.verts_per_quad * coloredLayout.bytes_per_vertex;
            }
            passEncoder.drawIndexed(6);
        }

        passEncoder.setPipeline(this.texturedPipeline);
        let dynamicTexturedOffset = 0;
        for (let i = 0; i < dynamicRects.length; i++) {
            const rect: Rect = dynamicRects[i];

            passEncoder.setBindGroup(0, this.getBindGroupForTexture(rect.texture!));
            passEncoder.setVertexBuffer(0, this.dynamicTexturedVertexBuffer, dynamicTexturedOffset);
            dynamicTexturedOffset += texturedLayout.verts_per_quad * texturedLayout.bytes_per_vertex;

            passEncoder.setIndexBuffer(this.indexBuffer, 'uint16');
            passEncoder.drawIndexed(6);
        }

        passEncoder.end();

        this.device.queue.submit([commandEncoder.finish()]);
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
            case "demon":
                return this.bindGroups[6];
        }
    }

    private static createPipelineFromLayout (device: GPUDevice, vertShader: string, fragmentShader: string, vertexBufferStride: number, attributes: Iterable<GPUVertexAttribute>, label: string)
    :GPURenderPipeline {
        const presentationFormat = navigator.gpu.getPreferredCanvasFormat();
        return device.createRenderPipeline({
            label: label,
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
