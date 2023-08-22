import {useRef, useEffect, useState} from "react";
import {fabric} from "fabric";
import {CircleRef, ImageRef, RectangleRef, TextBoxRef} from "../helpers/fabricHelpers";
import axios from "axios";
export { PDFDocumentLoadingTask, PDFDocumentProxy,
PDFPageProxy, getDocument } from 'pdfjs-dist';
import * as pdfjsLib from 'pdfjs-dist';
(pdfjsLib as any).GlobalWorkerOptions.workerSrc =
`//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.9.179/pdf.worker.js`;
export { pdfjsLib };

export const FabricDemo = (pdfData, pages) => {
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

	const Base64Prefix = "data:application/pdf;base64,";

	function readBlob(blob) {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.addEventListener('load', () => resolve(reader.result));
			reader.addEventListener('error', reject)
			reader.readAsDataURL(blob);
		})
	}

	async function printPDF(pdfData, pages = null) {
		// const pdfjsLib = await getPdfHandler();
		pdfData = pdfData instanceof Blob ? await readBlob(pdfData) : pdfData;
		const data = atob(pdfData.startsWith(Base64Prefix) ? pdfData.substring(Base64Prefix.length) : pdfData);
		// Using DocumentInitParameters object to load binary data.
		const loadingTask = pdfjsLib.getDocument({data});
		return loadingTask.promise
			.then((pdf) => {
				const numPages = pdf.numPages;
				return new Array(numPages).fill(0)
					.map((__, i) => {
						const pageNumber = i + 1;
						if (pages && pages.indexOf(pageNumber) == -1) {
							return;
						}
						return pdf.getPage(pageNumber)
							.then((page) => {
								//  retina scaling
								const viewport = page.getViewport({scale: window.devicePixelRatio});
								// Prepare canvas using PDF page dimensions
								const canvas = document.createElement('canvas');
								const context = canvas.getContext('2d');
								canvas.height = viewport.height
								canvas.width = viewport.width;
								// Render PDF page into canvas context
								const renderContext = {
									canvasContext: context,
									viewport: viewport
								};
								const renderTask = page.render(renderContext);
								return renderTask.promise.then(() => canvas);
							});
					});
			});
	}

	async function pdfToImage(pdfData) {
		const scale = 1 / window.devicePixelRatio;
		return (await printPDF(pdfData))
			.map(async c => {
				fabricRef.current.add(ImageRef(await c, {
					scaleX: scale,
					scaleY: scale,
				}));
			});
	}

	const hiddenFileInput = useRef(null);

	const handleFileClick = event => {
		hiddenFileInput.current.click();
	  };

	const handleChange = async (event) => {
	    const fileUploaded = event.target.files[0];
		await pdfToImage(fileUploaded)
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
			<button onClick={handleFileClick}>Upload File</button>
			<input type="file" accept="application/pdf" ref={hiddenFileInput} onChange={handleChange} style={{display: "none"}}/>
			<canvas ref={canvasRef} style={{height: "800px", width: "800px"}}/>
		</div>
	);
};
