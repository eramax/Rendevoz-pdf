export interface ElementBuilder<T>{
  build: (source: any) => T
}
