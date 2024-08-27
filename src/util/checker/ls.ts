const api =
	"https://archive.lightspeedsystems.com/domain_tab_info.php?text_file_name=reason&domain=";

const blockedCats = [
	"porn",
	"security",
	"security.proxy",
	"forums",
	"games",
	"adult",
	"mature",
	"facebook",
	"suspicous",
	"warez.security",
];

export default async function (link: string): Promise<boolean> {
	const domain: string = new URL(link).hostname;

	const response = await fetch(api + domain);

	const body: string = await response.text();

	console.log(`Scanning ${domain} for Lightspeed`);

	const lines: string[] = body.split("\n");

	const formatted: string[] = lines
		.map((line) => line.replace(/<br>/g, ""))
		.filter((line) => line !== "");

	if (formatted[0] === "No file Found") return false;

	let cat: string = "none";
	formatted.forEach((line) => {
		const split = line.split("CategorizeContent: Bayes Category: ");

		if (split.length === 2) cat = split[1];
	});

	console.log(`${domain} is categorized as ${cat}`);

	return blockedCats.includes(cat);
}
