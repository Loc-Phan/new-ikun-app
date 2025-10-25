import React from 'react';
import {Dimensions, View} from 'react-native';
import IframeRenderer, {iframeModel} from '@native-html/iframe-plugin';
import RenderHTML, {
  HTMLElementModel,
  HTMLContentModel,
} from 'react-native-render-html';
import WebView from 'react-native-webview';

const renderers = {
  iframe: props => (
    <View renderToHardwareTextureAndroid={true}>
      <IframeRenderer {...props} />
    </View>
  ),
};

const fontElementModel = HTMLElementModel.fromCustomModel({
  tagName: 'font',
  contentModel: HTMLContentModel.mixed,
  getUADerivedStyleFromAttributes({face, color, size}) {
    let style = {};
    if (face) {
      style.fontFamily = face;
    }
    if (color) {
      style.color = color;
    }
    if (size) {
      // handle size such as specified in the HTML4 standard. This value
      // IS NOT in pixels. It can be absolute (1 to 7) or relative (-7, +7):
      // https://www.w3.org/TR/html4/present/graphics.html#edef-FONT
      // implement your solution here
    }

    return style;
  },
});

const customHTMLElementModels = {
  iframe: iframeModel,
  font: fontElementModel,
};

const RenderDataHTML = React.memo(function RenderDataHTML({html, style = {}}) {
  return (
    <RenderHTML
      systemFonts={[
        'Inter',
        'Inter-ExtraLight',
        'Inter-Light',
        'Inter-Medium',
        'Inter-SemiBold',
        'Inter-Bold',
        'Inter-ExtraBold',
      ]}
      source={{
        html: html || '',
      }}
      tagsStyles={{
        body: {
          fontFamily: 'Inter-Regular',
          fontSize: 14,
          lineHeight: 22,
          color: '#000',
          ...style,
        },
      }}
      enableExperimentalMarginCollapsing
      renderers={renderers}
      WebView={WebView}
      contentWidth={Dimensions.get('window').width - 32}
      customHTMLElementModels={customHTMLElementModels}
      renderersProps={{
        img: {
          enableExperimentalPercentWidth: true,
        },
      }}
    />
  );
});

export default RenderDataHTML;
