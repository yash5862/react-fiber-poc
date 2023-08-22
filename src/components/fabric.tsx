import {useRef, useEffect, useState} from "react";
import {fabric} from "fabric";
import {CircleRef, RectangleRef, TextBoxRef} from "../helpers/fabricHelpers";
import axios from "axios";

export const FabricDemo = () => {
	const fabricRef = useRef(null);
	const canvasRef = useRef(null);
	const [fabricData, setFabricData] = useState<any>(null);
	const [windowDimensions, setWindowDimensions] = useState(
		getWindowDimensions()
	);

	const json = {
		version: "5.3.0",
		objects: [
			{
				type: "rect",
				version: "5.3.0",
				originX: "left",
				originY: "top",
				left: 50,
				top: 50,
				width: 50,
				height: 50,
				fill: "red",
				stroke: null,
				strokeWidth: 1,
				strokeDashArray: null,
				strokeLineCap: "butt",
				strokeDashOffset: 0,
				strokeLineJoin: "miter",
				strokeUniform: false,
				strokeMiterLimit: 4,
				scaleX: 1,
				scaleY: 1,
				angle: 0,
				flipX: false,
				flipY: false,
				opacity: 1,
				shadow: null,
				visible: true,
				backgroundColor: "",
				fillRule: "nonzero",
				paintFirst: "fill",
				globalCompositeOperation: "source-over",
				skewX: 0,
				skewY: 0,
				rx: 0,
				ry: 0,
			},
			{
				type: "circle",
				version: "5.3.0",
				originX: "left",
				originY: "top",
				left: 185,
				top: 91,
				width: 50,
				height: 50,
				fill: "green",
				stroke: null,
				strokeWidth: 1,
				strokeDashArray: null,
				strokeLineCap: "butt",
				strokeDashOffset: 0,
				strokeLineJoin: "miter",
				strokeUniform: false,
				strokeMiterLimit: 4,
				scaleX: 1,
				scaleY: 1,
				angle: 0,
				flipX: false,
				flipY: false,
				opacity: 1,
				shadow: null,
				visible: true,
				backgroundColor: "",
				fillRule: "nonzero",
				paintFirst: "fill",
				globalCompositeOperation: "source-over",
				skewX: 0,
				skewY: 0,
				radius: 25,
				startAngle: 0,
				endAngle: 360,
			},
			{
				type: "textbox",
				version: "5.3.0",
				originX: "left",
				originY: "top",
				left: 329,
				top: 82,
				width: 200,
				height: 18.08,
				fill: "rgb(0,0,0)",
				stroke: null,
				strokeWidth: 1,
				strokeDashArray: null,
				strokeLineCap: "butt",
				strokeDashOffset: 0,
				strokeLineJoin: "miter",
				strokeUniform: false,
				strokeMiterLimit: 4,
				scaleX: 1,
				scaleY: 1,
				angle: 0,
				flipX: false,
				flipY: false,
				opacity: 1,
				shadow: null,
				visible: true,
				backgroundColor: "",
				fillRule: "nonzero",
				paintFirst: "fill",
				globalCompositeOperation: "source-over",
				skewX: 0,
				skewY: 0,
				fontFamily: "Times New Roman",
				fontWeight: "normal",
				fontSize: 16,
				text: "Enter Your Text Here",
				underline: false,
				overline: false,
				linethrough: false,
				textAlign: "left",
				fontStyle: "normal",
				lineHeight: 1.16,
				textBackgroundColor: "",
				charSpacing: 0,
				styles: [],
				direction: "ltr",
				path: null,
				pathStartOffset: 0,
				pathSide: "left",
				pathAlign: "baseline",
				minWidth: 20,
				splitByGrapheme: false,
			},
		],
	};

	const getFirstRecord = () => {
		axios.get(`http://127.0.0.1:5000/view/first`).then((response) => {
			if (response?.data?.data) {
				// console.log("zXzxcx", response?.data?.data)
				console.log("zXzxcx", JSON.parse(response?.data?.data?.data))
				setFabricData(response?.data?.data);
				fabricRef.current.loadFromJSON(JSON.parse(response?.data?.data?.data), () => {
					fabricRef.current.renderAll();
				});
				fabricRef.current.renderAll();
			} else {
				setFabricData(null);
			}
		});
	}

	useEffect(() => {
		getFirstRecord()
	}, []);

	useEffect(() => {
		function handleResize() {
			setWindowDimensions(getWindowDimensions());
		}

		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	console.log(windowDimensions, "windowDimensions");

	useEffect((): any => {
		const initFabric = () => {
			fabricRef.current = new fabric.Canvas(canvasRef?.current);
			fabricRef.current.setHeight(windowDimensions.height);
			fabricRef.current.setWidth(windowDimensions.width);
			if (fabricData && fabricData.data) {
				fabricRef.current.loadFromJSON(fabricData.data, () => {
					fabricRef.current.renderAll();
				});
			}
			fabricRef.current.renderAll();
		};
		const disposeFabric = () => {
			fabricRef?.current.dispose();
		};
		initFabric();
		return () => {
			disposeFabric();
		};
	}, []);

	function getWindowDimensions() {
		const {innerWidth: width, innerHeight: height} = window;
		return {
			width,
			height,
		};
	}

	const addRectangle = () => {
		drawingModeOFF();
		const rect = RectangleRef();
		fabricRef.current.add(rect);
	};

	const addCircle = () => {
		drawingModeOFF();
		const circle = CircleRef();
		fabricRef.current.add(circle);
	};

	const addTextBox = () => {
		drawingModeOFF();
		const textBox = TextBoxRef();
		fabricRef.current.add(textBox);
	};

	const deleteSelected = () => {
		drawingModeOFF();
		fabricRef.current.getActiveObjects().forEach((obj) => {
			fabricRef.current.remove(obj);
		});
		fabricRef.current.discardActiveObject().renderAll();
	};

	const drawingModeON = () => {
		fabricRef.current.isDrawingMode = true;
	};

	const drawingModeOFF = () => {
		fabricRef.current.isDrawingMode = false;
	};

	const toggleDrawingMode = () => {
		fabricRef.current.isDrawingMode = !fabricRef.current.isDrawingMode;
	};

	const saveCanvas = () => {
		const canvasJSON = fabricRef.current.toJSON();
		console.log("fabricData", fabricData)
		const currentId = fabricData && fabricData.id ? fabricData.id : null
		if (currentId) {
			axios.post(`http://127.0.0.1:5000/update/${currentId}`, {data: canvasJSON}).then((response) => {
				getFirstRecord()
			});
		} else {
			axios.post("http://127.0.0.1:5000/create", {data: canvasJSON}).then((response) => {
				getFirstRecord()
			});
		}
	};

	return (
		<div style={{textAlign: "center"}}>
			<button onClick={addRectangle}>Rectangle</button>
			<button onClick={addCircle}>Circle</button>
			<button onClick={addTextBox}>TextBox</button>
			<button onClick={deleteSelected}>Delete Selected</button>
			<button onClick={toggleDrawingMode}>
				Drawing Mode {fabricRef?.current?.isDrawingMode ? "ON" : "OFF"}
			</button>
			<button onClick={saveCanvas}>{fabricData && fabricData.id ? "Update" : "Save"}</button>
			<canvas ref={canvasRef} style={{height: "800px", width: "800px"}}/>
		</div>
	);
};
