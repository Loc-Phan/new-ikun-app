import IframeRenderer, { iframeModel } from '@native-html/iframe-plugin';
import React, { useMemo } from 'react';
import { Dimensions, View } from 'react-native';
import RenderHTML, {
  HTMLContentModel,
  HTMLElementModel,
} from 'react-native-render-html';
import WebView from 'react-native-webview';

// --- renderers ---
const renderers = {
  iframe: (props: any) => (
    <View renderToHardwareTextureAndroid>
      <IframeRenderer {...props} />
    </View>
  ),
};

// --- font model ---
const fontElementModel = HTMLElementModel.fromCustomModel({
  tagName: 'font',
  contentModel: HTMLContentModel.mixed,
  getUADerivedStyleFromAttributes({ face, color, size }: any) {
    const style: any = {};
    if (face) style.fontFamily = face;
    if (color) style.color = color;
    if (size) {
      const sizeMap: Record<string, number> = {
        '1': 10,
        '2': 12,
        '3': 14,
        '4': 16,
        '5': 18,
        '6': 20,
        '7': 22,
      };
      style.fontSize = sizeMap[size] || 14;
    }
    return style;
  },
});

const customHTMLElementModels = {
  iframe: iframeModel,
  font: fontElementModel,
};

// --- fonts & style ---
const systemFonts = [
  'Inter',
  'Inter-ExtraLight',
  'Inter-Light',
  'Inter-Medium',
  'Inter-SemiBold',
  'Inter-Bold',
  'Inter-ExtraBold',
];

const defaultBodyStyle = {
  
  fontSize: 14,
  lineHeight: 22,
  color: '#000',
};

// --- component ---
const RenderDataHTML = React.memo(function RenderDataHTML({
  html = '',
  style = {},
}: {
  html?: string;
  style?: object;
}) {
  const contentWidth = useMemo(() => Dimensions.get('window').width - 32, []);

  const tagsStyles = useMemo(
    () => ({
      body: { ...defaultBodyStyle, ...style },
    }),
    [style],
  );

  return (
    <RenderHTML
      source={{ html }}
      systemFonts={systemFonts}
      tagsStyles={tagsStyles}
      enableExperimentalMarginCollapsing
      renderers={renderers}
      WebView={WebView}
      contentWidth={contentWidth}
      customHTMLElementModels={customHTMLElementModels}
      renderersProps={{
        img: {
          enableExperimentalPercentWidth: true,
        },
      }}
    />
  );
});

RenderDataHTML.displayName = 'RenderDataHTML';

export default RenderDataHTML;
