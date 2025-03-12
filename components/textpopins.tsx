import { View, Text } from 'react-native'
import React from 'react'

type Props = {
  text: string,
  weight: 400 | 500 | 600 | 700,
  size: number,
  color: string,
}

const textpopins = (props: Props) => {
  const { text, weight, size, color } = props;

  // Set font
  let font = "Poppins-Regular";
  if (weight === 500) {
    font = "Poppins-Medium";
  } else if (weight === 600) {
    font = "Poppins-SemiBold";
  } else if (weight === 700) {
    font = "Poppins-Bold";
  }

  return (
    <Text
      style={{
        fontFamily: font,
        fontSize: size,
        color: color,
      }}
    >
      { text }
    </Text>
  )
}

export default textpopins