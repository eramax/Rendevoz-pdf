export const isDocument = (item: any) => {
  return 'fileUrl' in item && 'metadata' in item
}

export const isNote = (item: any) => {
  return 'allBlockIds' in item
}
