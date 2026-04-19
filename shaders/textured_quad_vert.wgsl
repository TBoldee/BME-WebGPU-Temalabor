struct VertexInput {
    @location(0) pos:   vec2f,
    @location(1) uv: vec2f,
}

struct VertexOutput {
    @builtin(position) pos:   vec4f,
    @location(0)       texcoord: vec2f,
}

@vertex
fn main(vert: VertexInput) -> VertexOutput {
    var out: VertexOutput;
    out.pos  = vec4f(vert.pos, 0.0, 1.0);
    out.texcoord = vert.uv;
    return out;
}