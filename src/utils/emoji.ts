import emojiJson from '@/assets/emoji.json?raw'
import twitterEmoji from '@/assets/twitter-emoji-32.png'
export type Emoji = {
  name: string
  unified: string
  non_qualified: string
  image: string
  sheet_x: number
  sheet_y: number
  short_name: string
  short_names: string[]
  category: string
  sort_order: number
}

let emojiMap = new Map<string, Emoji>((JSON.parse(emojiJson)).map(i => [i.short_name, i]))
const getEmoji = async (name: string) => {
  const emoji = emojiMap.get(name)
  if (emoji) {
    return {
      x: emoji.sheet_x,
      y: emoji.sheet_y,
      imageSrc: twitterEmoji,
      name
    }
  }
}

export default getEmoji
