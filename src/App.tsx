import "./App.css"
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import highcharts3d from "highcharts/highcharts-3d";
import { useEffect, useRef, useState } from "react";
highcharts3d(Highcharts); //init 3d

const App =  () => {
  const ref = useRef<HighchartsReact.RefObject>(null);
  useEffect(() => {
    (function (H) {
      const chart = ref.current?.chart;
      if (!chart) return;
      
      function dragStart(eStart: any) {
        eStart = chart?.pointer.normalize(eStart);

        const posX = eStart.chartX;
        const posY = eStart.chartY;
        const alpha = chart?.options.chart?.options3d?.alpha;

        const beta = chart?.options.chart?.options3d?.beta;
        const sensitivity = 5; // lower is more sensitive
        const handlers: any[] = [];

        function drag(e: any) {
          e = chart?.pointer.normalize(e);

          chart?.update(
            {
              chart: {
                options3d: {
                  alpha: alpha! + (e.chartY - posY) / sensitivity,
                  beta: beta! + (posX - e.chartX) / sensitivity,
                },
              },
            },
            undefined,
            undefined,
            false
          );
        }

        function unbindAll() {
          handlers.forEach(function (unbind) {
            if (unbind) {
              unbind();
            }
          });
          handlers.length = 0;
        }

        handlers.push(H.addEvent(document, "mousemove", drag));
        handlers.push(H.addEvent(document, "touchmove", drag));

        handlers.push(H.addEvent(document, "mouseup", unbindAll));
        handlers.push(H.addEvent(document, "touchend", unbindAll));
      }
      H.addEvent(chart.container, "mousedown", dragStart);
      H.addEvent(chart.container, "touchstart", dragStart);
    })(Highcharts);
  }, [ref]);

  const [nrPoints, setNrPoints] = useState(1);

  const [points, setPoints] = useState<number[][]>([]);

  const [avg_distance_range, setAvg_distance_range] = useState<number[]>([
    0, 0,
  ]);
  const [min_distance_range, setMin_distance_range] = useState<number[]>([
    0, 0,
  ]);

  const options: Highcharts.Options = {
    chart: {
      type: "scatter3d",
      options3d: {
        enabled: true,
        alpha: 20,
        beta: 30,
        depth: 300,
        
      },
    },

    title: undefined,
    yAxis: {
      min: -2,
      max: 2,

      title: { text: "x" },
    },
    xAxis: {

      min: -2,
      max: 2,
      title: { text: "y" },
    },
    zAxis: {
      min: -2,
      max: 2,
      title: { text: "z" },
    },
    series: [
      {
        type: "scatter3d",
        data: points,
      }
    ],
  };
  const fibo_lattice = (n: number) => {
    const gr = (1 + Math.sqrt(5)) / 2;
    const points: number[][] = [];
    for (let i = 0; i < n; ++i) {
      const theta = (2 * Math.PI * i) / gr;
      const phi = Math.acos(1 - (2 * (i + 0.5)) / n);
      const x = Math.cos(theta) * Math.sin(phi);
      const y = Math.sin(theta) * Math.sin(phi);
      const z = Math.cos(phi);
      points.push([x, y, z]);
    }

    return points;
  };

  // const generate = () => {
  //   setPoints(fibo_lattice(nrPoints));
  // };

  useEffect(() => {
    tot_analyze(points);
  }, [points]);

  useEffect(()=>{
    setPoints(fibo_lattice(nrPoints));
  }, [nrPoints])

  const tot_analyze = (points: number[][]) => {
    const data: {total_distance:number,min_distance:number }[] = [];
    let min_total_distance = Infinity;
    let max_total_distance = -Infinity;
    let min_min_distance = Infinity;
    let max_min_distance = -Infinity;

    for (let k = 0; k < points.length; ++k) {
      const { total_distance, min_distance } = analyze(points, k);
      data.push({ total_distance, min_distance });
      min_total_distance = Math.min(min_total_distance, total_distance);
      max_total_distance = Math.max(max_total_distance, total_distance);

      min_min_distance = Math.min(min_min_distance, min_distance);
      max_min_distance = Math.max(max_min_distance, min_distance);
    }

    console.log(data);
    console.log({
      total_distance_range: [min_total_distance, max_total_distance],
    });
    console.log({ min_distance_range: [min_min_distance, max_min_distance] });

    setMin_distance_range([min_min_distance, max_min_distance]);
    setAvg_distance_range([min_total_distance/nrPoints, max_total_distance/nrPoints]);
  };

  const analyze = (points: number[][], i: number) => {
    const point = points[i];

    let total_distance = 0;
    let min_distance = Infinity;
    for (let k = 0; k < points.length; ++k) {
      if (k == i) continue;
      const p = points[k];
      const d =
        Math.pow(p[0] - point[0], 2) +
        Math.pow(p[1] - point[1], 2) +
        Math.pow(p[2] - point[2], 2);
      total_distance += d;
      min_distance = Math.min(min_distance, d);
    }

    return { total_distance, min_distance };
  };
  return (
    <div style={{width:"80vw", height:"80vh"}}>
      <input
        type="number"
        value={nrPoints}
        onChange={(e) => setNrPoints(Number(e.target.value))}
      />
      <div>
        <p>Min Distance Range: [{min_distance_range[0].toFixed(3)}, {min_distance_range[1].toFixed(3)}]</p>
        <p>Avg Distance Range:[{avg_distance_range[0].toFixed(3)}, {avg_distance_range[1].toFixed(3)}]</p>

      </div>

      <HighchartsReact
        highcharts={Highcharts}
        ref={ref}
        options={options}
        
        />
    </div>
  );
};

export default App;
