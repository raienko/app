[⬅️ Back](../../README.md)

# Custom Fonts

Custom fonts can be used to render [icons](https://github.com/oblador/react-native-vector-icons) and [text](https://blog.logrocket.com/adding-custom-fonts-react-native).

## Add new font

For `iOS` and `Android`:
- add `.ttf` file to the `~/assets/fonts` folder
- run `yarn fonts:link` in terminal to link fonts
- list font in [dictionary](../../src/constants/fonts.ts) (`~/src/constants/fonts`) for easier usability

For `Web`:
- font should be manually linked [here](../../src/utils/webtools/fonts.ts) (`~/src/utils/webtools/fonts`)

## ⚠️ IMPORTANT!

To make font work properly, font file name and font metadata should be the same.
iOS use font name from metadata. So if file named: `MyFont.ttf` but in metadata it's named as `My-Font`,
you'll have to use different font names for android and iOS or update font metadata.

I recommend to update font metadata using tools like [FontLab](https://www.fontlab.com)

## FAQ

### Fonts vertically aligned differently
Fonts on iOS and Android renders a bit differently...
You may face issues with font height or font baseline: when you try to center font with some icon or button vertically,
text may be few pixels lower on android or iOS.

You'll need to make some adjustments because the font baseline is different between iOS and Android.
For this, you need to follow these steps:
- [download Font Tools for Xcode](https://developer.apple.com/download/more/?=Font%20Tools%20for%20Xcode)
- run `ftxdumperfuser -t hhea -A d PATH_TO_FONT.ttf` in terminal
- edit dumped file PATH_TO_FONT.hhea.xml and set `lineGap="0"`
- if lineGap was 200 and `ascend="800"`, set `ascend` to the sum of these two, in this case: `1000`
- run `ftxdumperfuser -t hhea -A f PATH_TO_FONT.ttf` in terminal
- once it's done, new values are merged back into the source file.
- then update fonts `yarn fonts:link`

