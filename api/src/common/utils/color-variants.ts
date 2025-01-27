import {
  BRIGHTNESS_PERCENTAGE,
  DARK_PERCENTAGE,
  DARK_TEXT_COLOR,
  LIGHT_PERCENTAGE,
  LIGHT_TEXT_COLOR,
} from '../constants/colors.constants'
import { isDarkColor } from './color-utils'
import darkenColor from './dark-color'
import lightenColor from './lighten-color'

export default function getColorVariants(primaryColor: string) {
  const secondaryColor = lightenColor(primaryColor, BRIGHTNESS_PERCENTAGE)
  const lightColor = lightenColor(primaryColor, LIGHT_PERCENTAGE)
  const darkColor = darkenColor(primaryColor, DARK_PERCENTAGE)

  const colorTextButton = isDarkColor(primaryColor)
    ? LIGHT_TEXT_COLOR
    : DARK_TEXT_COLOR

  return {
    primaryColor: `#${primaryColor}`,
    secondaryColor: `#${secondaryColor}`,
    colorTextButton: `#${colorTextButton}`,
    lightColor: `#${lightColor}`,
    darkColor: `#${darkColor}`,
  }
}
