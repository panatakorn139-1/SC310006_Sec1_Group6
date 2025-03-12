import { View, Text } from 'react-native'
import React from 'react'

type Props = {
    text: string,
    weight: 400 | 500 | 600 | 700,
}

const TextPoppins = (props: Props) => {
    const { text, weight } = props;

    let font = 'Poppins-Regular';
    if (weight === 500) {
        font = 'Poppins-Medium';
    } else if (weight === 600) {
        font = 'Poppins-SemiBold';
    } else if (weight === 700) {
        font = 'Poppins-Bold';
    }

    return (
        <Text
            style={{
                fontFamily: font,
                fontWeight: weight,
            }}
        >
            { text }
        </Text>
    )
}

export default TextPoppins