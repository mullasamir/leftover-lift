import { SCENES } from './scenes.js'

/** Large illustration for a food category. Markup is a static string from scenes.js. */
export default function FoodScene({ category = 'bakery', markup, className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 240 160"
      aria-hidden="true"
      focusable="false"
      dangerouslySetInnerHTML={{ __html: markup ?? SCENES[category] ?? SCENES.bakery }}
    />
  )
}
