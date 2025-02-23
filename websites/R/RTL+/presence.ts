const presence = new Presence({
		clientId: "1033504954763198545",
	}),
	getStrings = async () => {
		return presence.getStrings(
			{
				play: "general.playing",
				pause: "general.paused",
			},
			await presence.getSetting<string>("lang").catch(() => "en")
		);
	},
	browsingTimestamp = Math.floor(Date.now() / 1000);

const enum Assets {
	Logo = "https://i.imgur.com/fMMsZfV.jpg",
}

let video: HTMLVideoElement,
	vidTitle: string,
	strings: Awaited<ReturnType<typeof getStrings>> = null;

presence.on("UpdateData", async () => {
	const [startTimestamp, endTimestamp] = presence.getTimestamps(
			Math.floor(video?.currentTime),
			Math.floor(video?.duration)
		),
		presenceData: PresenceData = {
			largeImageKey: Assets.Logo,
		},
		{ pathname, href } = document.location;

	if (!strings) strings = await getStrings();

	if (document.querySelector("#bitmovinplayer-video-player_container")) {
		video = document.querySelector<HTMLVideoElement>(
			"#bitmovinplayer-video-player_container"
		);

		if (!isNaN(video.duration)) {
			const footerEles = document.querySelectorAll("li.ng-star-inserted"),
				cover: HTMLImageElement = document.querySelector("img.dvd-cover");

			presenceData.smallImageKey = video.paused ? Assets.Pause : Assets.Play;
			presenceData.smallImageText = video.paused ? strings.pause : strings.play;
			presenceData.startTimestamp = startTimestamp;
			presenceData.endTimestamp = endTimestamp;
			presenceData.buttons = [
				{
					label: "View",
					url: href,
				},
			];

			if (pathname.includes("/serien/") || pathname.includes("/shows/")) {
				const season = footerEles[3]
						?.querySelector("a>span")
						?.textContent.replace("Staffel ", "")
						.trim(),
					episode = footerEles[4]
						?.querySelector("span")
						?.textContent.split(" Folge ");

				vidTitle = footerEles[2]?.querySelector("a>span")?.textContent.trim();

				presenceData.state = `S${season}:E${episode?.[1]?.trim()} ${episode?.[0]?.trim()}`;
				presenceData.buttons[0].label = "Watch Series";
			} else if (pathname.includes("/filme/")) {
				vidTitle = footerEles[2]?.querySelector("a>span")?.textContent.trim();
				presenceData.buttons[0].label = "Watch Movie";
			}

			if (!vidTitle) {
				vidTitle = document.title
					.replace("im Online Stream | RTL+", "")
					.replace("im Online Stream ansehen | RTL+", "")
					.trim();
			}

			if (cover) presenceData.largeImageKey = cover.src;

			presenceData.details = vidTitle;

			if (video.duration <= 5) {
				delete presenceData.startTimestamp;
				delete presenceData.endTimestamp;

				presenceData.smallImageKey = Assets.Pause;
				presenceData.smallImageText = strings.pause;
			}
		}
	} else if (pathname === "/") presenceData.details = "Viewing main page";
	else if (pathname.includes("/serien/")) {
		presenceData.details = "Viewing series";
		presenceData.buttons = [
			{
				label: "View Series",
				url: href,
			},
		];
	} else if (pathname.includes("/shows/")) {
		presenceData.details = "Viewing show";
		presenceData.buttons = [
			{
				label: "View Show",
				url: href,
			},
		];
	} else if (pathname.includes("/serien"))
		presenceData.details = "Browsing series";
	else if (pathname.includes("/shows")) presenceData.details = "Browsing shows";
	else if (pathname.includes("/filme/")) {
		presenceData.details = "Viewing movie";
		presenceData.buttons = [
			{
				label: "View Movie",
				url: href,
			},
		];
	} else if (pathname.includes("/filme"))
		presenceData.details = "Browsing movies";
	else if (pathname.includes("/specials/")) {
		presenceData.details = "Viewing special";
		presenceData.buttons = [
			{
				label: "View Special",
				url: href,
			},
		];
	}

	if (isNaN(video?.duration)) {
		presenceData.startTimestamp = browsingTimestamp;

		if (pathname !== "/") {
			presenceData.state =
				document.querySelector(".ng-tns-c96-53")?.textContent ??
				document.title
					.replace("im Online Stream | RTL+", "")
					.replace("im Online Stream ansehen | RTL+", "")
					.trim();
		}
	}

	if (presenceData.details) presence.setActivity(presenceData);
	else presence.setActivity();
});
