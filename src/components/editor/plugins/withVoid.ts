const withVoid = (editor: CustomEditor) => {
  const { isVoid,isInline } = editor
  const checkIfVoidComponents = (element: CustomElement) => {
    switch (element.type) {
      case 'textSelectionCard':
        return true
      case 'spacer':
        return false
      case 'highlight':
        return true
      case 'emoji':
        return true
      case 'image':
        return true
      case 'thought':
        return true
      case 'subPage':
        return true
      default:
        return false
    }
  }
  editor.isInline = element => ['emoji'].includes(element.type) || isInline(element)
  editor.isVoid = element => {
    return checkIfVoidComponents(element) ? true : isVoid(element)
  }
  return editor
}

export default withVoid
