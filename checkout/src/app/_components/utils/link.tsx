export const formatLink = (link: string) => {
  if (link[link.length - 1] === '/') {
    link = link.slice(0, -1)
  }
  return link.replace(/https?:\/\//, '')
}
