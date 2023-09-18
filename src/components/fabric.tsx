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
	const [pdfHeight, setPdfHeight] = useState(0);

	const getFirstRecord = () => {
		axios.get(`http://127.0.0.1:4000/view/first`).then((response) => {
			
			if (response?.data?.data) {
				setFabricData(response?.data?.data);
				console.log('fabricData', response?.data?.data);
				
				const apiRes = JSON.parse(response?.data?.data?.data)
				fabricRef.current.loadFromJSON(apiRes.data, () => {
					fabricRef.current.renderAll();
				});
				fabricRef.current.renderAll();

				if (fabricRef.current && apiRes.height) {
					fabricRef.current.setHeight(apiRes.height);
				}
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

	useEffect((): any => {
		const initFabric = () => {
			fabricRef.current = new fabric.Canvas(canvasRef?.current);
			fabricRef.current.setHeight(windowDimensions.height);
			fabricRef.current.setWidth(windowDimensions.width);
			
			// console.log('fabricData', fabricData);

			// if (fabricData && fabricData.data.data) {
			// 	fabricRef.current.loadFromJSON(fabricData.data.data, () => {
			// 		fabricRef.current.renderAll();
			// 	});
			// }

			// if (fabricData && fabricData.data.height) {
			// 	if (fabricRef.current && pdfHeight) {
			// 		fabricRef.current.setHeight(fabricData.data.height);
			// 	}
			// }
			// fabricRef.current.renderAll();
		};
		const disposeFabric = () => {
			fabricRef?.current.dispose();
		};
		initFabric();
		return () => {
			disposeFabric();
		};
	}, []);

	useEffect(() => {
		if (fabricRef.current && pdfHeight) {
			fabricRef.current.setHeight(pdfHeight);
		}
	}, [pdfHeight]);

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
		const currentId = fabricData && fabricData.id ? fabricData.id : null
		if (currentId) {
			axios.post(`http://127.0.0.1:4000/update/${currentId}`, {data: {height: pdfHeight ? pdfHeight : 800, data: canvasJSON}}).then((response) => {
				getFirstRecord()
			});
		} else {
			axios.post("http://127.0.0.1:4000/create", {data: {height: pdfHeight ? pdfHeight : 800, data: canvasJSON}}).then((response) => {
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
								canvas.height = viewport.height; // fetching height of the page
								canvas.width = viewport.width; // fetching width of the page
								// Render PDF page into canvas context
								const renderContext = {
									canvasContext: context,
									viewport: viewport
								};
								const renderTask = page.render(renderContext);
								return renderTask.promise.then(() => ({ canvas, page}));
							});
					});
			});
	}

	const pdfToImage = async (pdfData) => {
		
		const scale = 1 / window.devicePixelRatio;
		let tempPdfHeight = pdfHeight;
		(await printPDF(pdfData)).map(async c => {
				const obj = await c;
				const canvas = obj.canvas;
				const page = obj.page;
				// console.log('pageRef',canvas, page, page.view);
				
				fabricRef.current.add(ImageRef(canvas, {
					scaleX: scale,
					scaleY: scale,
					top: tempPdfHeight + 20, // 20px of padding
					stroke: '#07C', //<-- set this
      				strokeWidth: 5,
					selectable: false
				}));

				tempPdfHeight = tempPdfHeight + page.view[3] + 20;
				setPdfHeight(tempPdfHeight);
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
			<div className="canvasContainer" style={{ overflowY: 'scroll', height: '800px', width: '100%', textAlign: 'center' }}>
				<canvas ref={canvasRef} style={{height: "800px", border: "1px solid #000000"}}/>
			</div>
		</div>
	);
};
