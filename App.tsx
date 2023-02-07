/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {SafeAreaView, StyleSheet, View, Text as LText} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {LineGraph} from 'react-native-graph';
import {
  GraphPoint,
  GraphRange,
  SelectionDotProps,
} from 'react-native-graph/lib/typescript/LineGraphProps';
import {
  DashPathEffect,
  Group,
  Line,
  Text,
  useCanvas,
  useComputedValue,
  useFont,
  vec,
} from '@shopify/react-native-skia';
import dayjs from 'dayjs';

const potentialIssuePoints = [
  [1673308800000, 0],
  [1673395200000, 0],
  [1673481600000, 0],
  [1673568000000, 0],
  [1673654400000, 0],
  [1673740800000, 0],
  [1673827200000, 0],
  [1673913600000, 0],
  [1674518400000, 102282.92349389535],
  [1674604800000, 100614.77326242015],
  [1675217972000, 102822.1618722031],
];

const brokenPointsOne = [
  [1673568000000, 0],
  [1673654400000, 0],
  [1673740800000, 0],
  [1673827200000, 0],
  [1673913600000, 0],
  [1674518400000, 102282.92349389535],
  [1674604800000, 100614.77326242015],
  [1674691200000, 103153.11280976745],
  [1674777600000, 102460.35075209786],
  [1674864000000, 102718.95062903097],
  [1674950400000, 102449.16703385272],
  [1675036800000, 105898.93895683048],
  [1675123200000, 101639.9454755057],
  [1675209600000, 102961.32118892882],
  [1675217972000, 102822.1618722031],
];

const brokenPointsTwo = [
  [1675238515651000, 23077.519338684473],
  [1675242061584000, 22983.2497291696],
  [1675245648442000, 22980.5166331661],
  [1675249226554000, 23002.770936751556],
  [1675252914699000, 23091.180067880403],
  [1675256418543000, 23077.910219916226],
  [1675260176062000, 23089.67754873535],
  [1675263782774000, 23132.65165753504],
  [1675267306516000, 23022.947280472457],
  [1675270885859000, 22988.904359620166],
  [1675274515820000, 23011.16783405337],
  [1675278043496000, 23084.570177087546],
  [1675281702343000, 23431.65820444607],
  [1675285215992000, 23586.078259820446],
  [1675288929095000, 23723.290221980456],
  [1675292528645000, 23708.528154342304],
  [1675296112741000, 23725.161796142238],
  [1675299724996000, 24182.858615243647],
  [1675303345596000, 24030.03279601706],
  [1675306857118000, 23919.057508890204],
  [1675310455694000, 23922.258194341037],
  [1675314038059000, 23909.64831902795],
  [1675317781006000, 23834.865208529314],
  [1675318026962000, 23860.78103031741],
  [1675321429215000, 23865.5807015988],
  [1675323158000000, 23831.107568749427],
];

interface SelectionProps extends SelectionDotProps {
  points: GraphPoint[];
  circleX: any;
}

const GRAPH_VERTICAL_PADDING = 40;
const GRAPH_LINE_THICKNESS = 6;
const GRAPH_GRADIENT = ['#FF5912', '#FFA724'];
const SELECTION_LABEL_FONT_SIZE = 12;

const Selection = ({circleX, points}: SelectionProps) => {
  const parentCanvas = useCanvas();

  const text = useComputedValue(() => {
    if (parentCanvas.size.current.width === 0) {
      return '';
    }
    const widthPercentage = circleX.current / parentCanvas.size.current.width;
    const index = Math.floor((points.length - 1) * widthPercentage);
    if (index > points.length - 1) {
      return '';
    }
    const closestDate = points[index].date;
    return dayjs(closestDate).format('HH:mmA');
  }, [parentCanvas, points, circleX]);

  const transform = useComputedValue(() => {
    return [{translateX: circleX.current}];
  }, [circleX]);

  const font = useFont(
    require('./UntitledSans-Regular.ttf'),
    SELECTION_LABEL_FONT_SIZE,
  );

  const textWidth = useComputedValue(() => {
    if (font == null) {
      return;
    }
    return font.getTextWidth(text.current);
  }, [text, font]);

  if (font == null || textWidth.current == null) {
    return null;
  }

  return (
    <Group transform={transform}>
      <Text
        x={-textWidth.current / 2}
        y={SELECTION_LABEL_FONT_SIZE}
        text={text}
        font={font}
        color="#AAA"
      />
      <Line
        p1={vec(0, SELECTION_LABEL_FONT_SIZE + 10)}
        p2={vec(0, 250)}
        color="#F26935"
        strokeWidth={2}
        strokeCap="round">
        <DashPathEffect intervals={[10, 10]} />
      </Line>
    </Group>
  );
};

function generateRandomGraphData(length: number) {
  return Array<number>(length)
    .fill(0)
    .map((_, index) => ({
      date: new Date(new Date(2022, 0, 1).getTime() + 1000 * 60 * 60 * index),
      value: Math.random() * 100,
    }));
}

function App(): JSX.Element {
  const [selectedPoint, setSelectedPoint] = useState<GraphPoint>();

  const points: GraphPoint[] = useMemo(() => {
    return generateRandomGraphData(20);
    // return potentialIssuePoints.map(x => ({
    //   date: new Date(x[0]),
    //   value: x[1],
    // }));

    // return brokenPointsOne.map(x => ({
    //   date: new Date(x[0]),
    //   value: x[1],
    // }));
    // return brokenPointsTwo.map(x => ({
    //   date: new Date(x[0]),
    //   value: x[1],
    // }));
  }, []);

  const latestDate = useMemo(
    () =>
      points.length !== 0 && points[points.length - 1] != null
        ? points[points.length - 1]!.date
        : undefined,
    [points],
  );

  const range: GraphRange | undefined = useMemo(() => {
    if (points.length !== 0 && latestDate != null) {
      return {
        x: {
          min: points[0]!.date,
          max: new Date(latestDate.getTime() + 30),
        },
        y: {
          min: Math.min(...points.map(p => p.value)),
          max: Math.max(...points.map(p => p.value)),
        },
      };
    } else {
      return {
        y: {
          min: Math.min(...points.map(p => p.value)),
          max: Math.max(...points.map(p => p.value)),
        },
      };
    }
  }, [latestDate, points]);

  const onPointSelected = useCallback((point: GraphPoint) => {
    setSelectedPoint(point);
  }, []);

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <SafeAreaView style={styles.container}>
        <LText style={{fontSize: 32}}>
          {selectedPoint ? selectedPoint.value : points[0].value}
        </LText>
        <LineGraph
          style={styles.graph}
          points={points}
          range={range}
          animated={true}
          enablePanGesture
          color={GRAPH_GRADIENT}
          lineThickness={GRAPH_LINE_THICKNESS}
          verticalPadding={GRAPH_VERTICAL_PADDING}
          SelectionDot={selectionProps => (
            <Selection {...selectionProps} points={points} />
          )}
          onPointSelected={onPointSelected}
        />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
  },
  graph: {
    width: '100%',
    height: 220,
  },
});
