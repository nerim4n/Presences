const presence = new Presence({
		clientId: "634081860972052490",
	}),
	strings = presence.getStrings({
		play: "general.playing",
		pause: "general.paused",
		browsing: "general.browsing",
	});
let video = {
	duration: 0,
	currentTime: 0,
	paused: true,
};

const enum Assets {
	Logo = "https://i.imgur.com/Nsp0rTW.jpg",
}

presence.on(
	"iFrameData",
	(data: { duration: number; currentTime: number; paused: boolean }) => {
		video = data;
	}
);

presence.on("UpdateData", async () => {
	const presenceData: PresenceData = {
		largeImageKey: Assets.Logo,
	};

	if (
		video &&
		!isNaN(video.duration) &&
		document.location.pathname.includes("/ver")
	) {
		[presenceData.startTimestamp, presenceData.endTimestamp] =
			presence.getTimestamps(
				Math.floor(video.currentTime),
				Math.floor(video.duration)
			);

		presenceData.details = document.querySelector(
			"#XpndCn .Title, .CapiCnt .Title"
		).textContent;
		presenceData.smallImageKey = video.paused ? Assets.Pause : Assets.Play;
		presenceData.smallImageText = video.paused
			? (await strings).pause
			: (await strings).play;

		if (video.paused) {
			delete presenceData.startTimestamp;
			delete presenceData.endTimestamp;
		}

		presence.setActivity(presenceData, !video.paused);
	} else {
		presenceData.details = (await strings).browsing;
		presenceData.smallImageKey = Assets.Search;
		presenceData.smallImageText = (await strings).browsing;
		presence.setActivity(presenceData);
	}
});
