const presence = new Presence({
		clientId: "800702121866559508",
	}),
	browsingTimestamp = Math.floor(Date.now() / 1000);

const enum Assets {
	Logo = "https://i.imgur.com/R29E1DX.png",
}

presence.on("UpdateData", async () => {
	const presenceData: PresenceData = {
			largeImageKey: Assets.Logo,
			startTimestamp: browsingTimestamp,
		},
		{ pathname } = document.location,
		privacy = await presence.getSetting<number>("privacy");
	let locationScript: {
			name: string | null;
			region: string | null;
			country: string | null;
		},
		locationTitle: string;
	if (
		document
			.querySelector("head")
			.childNodes[9]?.textContent.includes('country":')
	) {
		locationScript = JSON.parse(
			document
				.querySelector("head")
				.childNodes[9].textContent.replace(/(<!-- {2})|( -->)|( HOST: )/gm, "")
		);
	} else if (
		document
			.querySelector("head")
			.childNodes[10]?.textContent.includes('country":')
	) {
		locationScript = JSON.parse(
			document
				.querySelector("head")
				.childNodes[10].textContent.replace(/(<!-- {2})|( -->)|( HOST: )/gm, "")
		);
	} else locationScript = null;

	const search = document.querySelector<HTMLInputElement>(
		'[class="input white-text focus"]'
	);

	if (search?.value) {
		if (privacy === 2) {
			presenceData.details = "Zoekt naar";
			presenceData.state = search.value;
		} else presenceData.details = "Aan het zoeken";
		presenceData.smallImageKey = Assets.Search;
	} else if (locationScript === null) {
		if (pathname === "/") presenceData.details = "Bekijkt de home pagina";
		else presenceData.details = "Aan het browsen..";
	} else {
		locationTitle =
			privacy === 0
				? `Een locatie in ${locationScript.country}`
				: privacy === 1
				? `Een locatie in ${locationScript.region}`
				: privacy === 2
				? locationScript.name
				: "Een Privé locatie";

		presenceData.state = locationTitle;
		presenceData.smallImageKey = document
			.querySelector('[class="icon left"]')
			.getAttribute("src")
			.split("weather/")[1]
			.replace(".svg", "")
			.toLowerCase();
		if (
			document.querySelector('[class="ip-btn ip-active"]')?.textContent ??
			document.querySelector('[class="ip-btn"]')?.textContent !== "❚❚"
		)
			presenceData.details = "Bekijkt de weersverwachting voor";
		else presenceData.details = "Bekijkt de weersgrafiek voor";
	}

	if (presenceData.details) presence.setActivity(presenceData);
	else presence.setActivity();
});
