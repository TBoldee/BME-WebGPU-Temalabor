struct Vertex {
    @location(0) pos: vec2f,
}

@vertex
fn main(vert: Vertex) -> @builtin(position) vec4f {
    return vec4f(vert.pos, 0.0, 1.0);
}
