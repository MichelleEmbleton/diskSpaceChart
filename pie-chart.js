
(function createChart(){
	
   const url = 'http://localhost:5500/data.json',     // check port - 5500 usual for live server
   		ns = "http://www.w3.org/2000/svg",
		svg = document.getElementById('pie-chart'),
		totals = document.querySelector('.totals'),
		totalsText = document.getElementById("totals-text");
		detailBar = document.querySelector(".detail"),
		buttons = document.querySelector('.buttons'),
		freeLabel = document.querySelector(".freespace-label"),
		usedLabel = document.querySelector(".usedspace-label"),
		errorDisplay = document.querySelector(".error"),
		diam = 250,
		r = 125,
		circ = 786, 	// 2 pi r
		totalSpace = 10000;
	let usedSpace = 0,
		freeSpace = 10000;



	// pie
	const pie = document.createElementNS(ns, 'circle');
	pie.setAttribute("class", "pie");	
	pie.setAttribute("cx", diam);
	pie.setAttribute("cy", diam);
	pie.setAttribute("r", r);
	svg.appendChild(pie);

	

	const calcUsedSpace = () => {	
		const spacePercent = (circ *((+usedSpace/totalSpace) * 100)/100); 			
		pie.style.strokeDasharray = `${spacePercent},${circ}`;
		renderTotalsDetail();
		renderPieLabels();	
	};
	// totals button
	const totalSpaceBtn = document.createElement("button");
	totalSpaceBtn.setAttribute("class", "total-button");
	totalSpaceBtn.innerText = "Total Space";
	totals.appendChild(totalSpaceBtn);
	totals.addEventListener('click', calcUsedSpace, true);
	

 
	const configData = data => {

		data.map(el => {
			const dataItem = el.title;
			const dataSpace = el.space;
			usedSpace += +el.space;
			freeSpace = totalSpace - usedSpace;

			const itemButton = document.createElement("button");
			itemButton.setAttribute("class", "item-button");	   
			itemButton.innerText = dataItem;
			itemButton.setAttribute("id", `${dataItem}*${dataSpace}`);
			buttons.appendChild(itemButton);

			const itemBtn = document.getElementById(`${dataItem}*${dataSpace}`); 
			itemBtn.addEventListener('click', e => calcPieShares(e.target));

			// detail bar
			const renderDetail = (item, space, totalSpace) => {
				const pc = ((space / totalSpace)*100).toFixed(2);  
				detailBar.classList.add('show-detail');
				detailBar.innerHTML = `
					<p class='percents'>
						<span> ${item} </span> 
						<span> ${space} mb </span>
						<span> ${pc}% </span>
					</p>
				`;
			};

			const calcPieShares = itemButton => {
				let [item, space] = itemButton.id.split("*");  								
				const spacePercent = (circ *((+(space)/totalSpace) * 100)/100); 
				pie.style.strokeDasharray = `${spacePercent},${circ}`; 
				renderDetail(item, space, totalSpace);

				const minRad = +(((30) * (Math.PI / 180)).toFixed(4)); 	
				const maxRad = +(((45) * (Math.PI / 180)).toFixed(4));	
				const xa = diam + Math.round(r * Math.cos(minRad));
				const ya = diam + Math.round(r * Math.sin(minRad));        
				const xb = diam + Math.round(r * Math.cos(maxRad));
				const yb = diam + Math.round(r * Math.sin(maxRad));   
				const isReflex = 45 - 30 <= 180 ? 0 : 1;
				const sectorLine = `M${diam} ${diam} L ${xa}, ${ya}`;
				const sectorArc = `M ${xa} ${ya} A ${diam} ${diam} 0 ${isReflex} 1 ${xb} ${yb}`;
			
				const sectorBorder = document.createElementNS(ns, 'path');
				sectorBorder.setAttribute("class", "sector-border");	
				sectorBorder.setAttribute("stroke", "#ff0000");
				sectorBorder.setAttribute("stroke-width", 1);
				sectorBorder.setAttribute("stroke-dasharray", "10,10");
				sectorBorder.setAttribute("d", sectorLine);	
				const arc = document.createElementNS(ns, "path");
				arc.setAttribute("d", sectorArc);
			
				pie.appendChild(sectorBorder);
				pie.appendChild(arc);
			}
		});
	};


	const renderTotalsDetail = () => {
		totals.classList.add('show-totals');
		totalsText.innerHTML = `
			<div class='totals-text'>
				<p> Total Space: <span> ${(totalSpace/1024).toFixed(2)} GB </span></p>
				<p> Used Space: <span> ${(usedSpace/1024).toFixed(2)} GB </span></p>
				<p> Free Space: <span> ${(freeSpace/1024).toFixed(2)} GB </span></p>
			</div>
		`;
		document.querySelector('.total-button').style.display = "none";
		detailBar.classList.remove('show-detail');
		detailBar.innerHTML = "";
	};

	// pie labels
	const renderPieLabels = () => {
		freeLabel.innerHTML = `<p class='space-text'> Free Space: ${(freeSpace/1024).toFixed(2)} GB </p>`	
		usedLabel.innerHTML = `<p class='space-text'> Used Space: ${(usedSpace/1024).toFixed(2)} GB </p>`;	
	};

	(async function init(){
		try {
			const res = await fetch(url);
			if(!res.ok) throw new Error(`Problem loading data!`);
			const data = await res.json();
			configData(data);
			
		} catch(err){
			console.log(err);
			errorDisplay.innerHTML=`<div class="error-message"> ${err} </div>`;
		}
	})();

})();
	
