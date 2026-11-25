import type { AgentState } from "@tensquads/ui/schemas";
import type { Locale } from "./state";

type LoopKind = "loop" | "once" | "onceAndLoop";

export const mascotMotionPath = "/foundations/mascots/motion";

export const motionStates = [
	{ state: "idle", kind: "loop" },
	{ state: "waiting", kind: "loop" },
	{ state: "planning", kind: "loop" },
	{ state: "running", kind: "loop" },
	{ state: "checking", kind: "loop" },
	{ state: "done", kind: "once" },
	{ state: "sentback", kind: "onceAndLoop" },
	{ state: "blocked", kind: "loop" },
	{ state: "escalated", kind: "loop" },
	{ state: "dropped", kind: "loop" },
] as const satisfies readonly { state: AgentState; kind: LoopKind }[];

export const motionSteps = [
	{ id: "waiting", state: "waiting" },
	{ id: "planning", state: "planning" },
	{ id: "first-run", state: "running" },
	{ id: "first-check", state: "checking" },
	{ id: "sentback", state: "sentback" },
	{ id: "second-run", state: "running" },
	{ id: "second-check", state: "checking" },
	{ id: "done", state: "done" },
] as const;

export const motionSizes = [160, 64, 32, 24, 16] as const;
export const alarmSizes = [64, 24] as const;

type StateCopy = readonly [label: string, motion: string, reason: string, spec: string];

export const mascotMotionCopy = {
	en: {
		title: "Mascot motion",
		lead: "Squadmates act out what they are doing. Each state is a small performance: the whole body, both arms, the feet and the face take part. The timing comes from the motion tokens, and every move stops when the person asks for less motion.",
		replay: "Replay one-shots",
		reduce: "Reduce motion",
		pause: "Pause",
		principlesTitle: "Principles",
		principlesLead: "Six rules keep the motion lively without making screens noisy.",
		principles: [
			[
				"Motion means state",
				"One signature motion per state. If a person cannot tell the state with the motion off, the drawing is wrong, not the motion.",
			],
			[
				"Act with the whole body",
				"Feet, arms, face and body each have a part. Squash before a jump and stretch in the air. Arms swing from the shoulder, feet step from the heel.",
			],
			[
				"Energy follows the state",
				"Calm states (idle, waiting, dropped) loop slowly over 3–7 s. Busy states (running, checking) move every 0.5–1.6 s. Only Escalated is loud.",
			],
			[
				"Tokens only",
				"State changes use `duration-enter` 240 ms with `ease-enter`. Loops use `ease-move`. Exits use `duration-exit` 120 ms.",
			],
			[
				"One performer at a time",
				"In a list, only the active or focused squadmate moves. The rest hold their still drawing. Pause off-screen and in hidden tabs.",
			],
			[
				"Respect reduced motion",
				"Under `prefers-reduced-motion` nothing moves; the drawing and badge carry the state. At 24 px and below only the face and badge move.",
			],
		],
		statesTitle: "The ten states",
		statesLead:
			'Petra in every state. "Loop" runs while the state lasts. "Once" plays on entry and then holds. Press "Replay one-shots" to see Done again.',
		kinds: { loop: "Loop", once: "Once", onceAndLoop: "Once + loop" },
		states: {
			idle: [
				"Idle",
				"Breathe, look around, wave",
				"Friendly and present.",
				"Body squash 2.5%, 3 s. Face glances left and right, 7 s. Right arm waves twice every 5 s. Blink every 4.8 s.",
			],
			waiting: [
				"Waiting",
				"Sway and tap a foot",
				"Ready for the next job.",
				"Body sways ±3°, 3.2 s. Right foot taps every 1.1 s. Face glances, 6 s.",
			],
			planning: [
				"Planning",
				"Think, hand to chin",
				"Working it out.",
				"Face tilts up 7°, 2.4 s. Left arm lifts 14°. Thought dots pop up one by one, 1.8 s, 300 ms stagger.",
			],
			running: [
				"Running",
				"March in place",
				"Busy and moving.",
				"Body bobs 12 units, 0.5 s. Feet step in turn, arms swing ±16°, 1 s. Shadow pulses with the bob.",
			],
			checking: [
				"Checking",
				"Lean in and scan",
				"Looking hard at the work.",
				"Body leans 3–5°. Face scans side to side, 1.6 s. Right arm holds its tool up.",
			],
			done: [
				"Done",
				"Jump and cheer",
				"A real win.",
				"Squash, jump 70 units, stretch, land, settle, 1.1 s. Both arms go up 60–72°. Badge spins in with an overshoot.",
			],
			sentback: [
				"Sent back",
				"Deflate, then sigh",
				"Disappointed, will try again.",
				"Small rise then droop 10 units, arms drop 12°, face hangs 6°, 600 ms. Then a sigh every 4 s.",
			],
			blocked: [
				"Blocked",
				"Tap impatiently",
				"Waiting on a person.",
				"Right foot double-taps, 0.9 s. Badge beats twice every 2 s.",
			],
			escalated: [
				"Escalated",
				"Wave for help",
				"Needs you now.",
				"Shake ±9 units then hop 22, 1.4 s. Arms flail ±50°, 0.35 s. Badge ring expands, 1.4 s.",
			],
			dropped: [
				"Dropped",
				"Snore and nod off",
				"Fast asleep.",
				"Deep breath 3.5%, 4 s. Head nods down and jerks back once per breath. Each z drifts up and grows, 3 s.",
			],
		},
		flowTitle: "Changing state",
		flowLead:
			"Pisa runs a task loop. The old drawing fades out over 120 ms while the new one fades in over 240 ms, and the new state's motion starts once the fade ends. The motion never morphs one pose into another.",
		flowHold: "Each step holds for 2.2 s in this demo.",
		sizeTitle: "Size",
		sizeLead:
			"At 64 px and up the whole body performs. At 32 px the bust crop does the same. At 24 px and below only the face and badge move, so avatars in tables and chat stay calm.",
		pixels: (size: number) => `${size} px`,
		alarmSize: (size: number) => `Escalated ${size} px`,
		specTitle: "Spec",
		specLead:
			"Units are drawing units (about 6 per pixel at 64 px). Each part turns around its own joint: the body around the feet, arms around the shoulder, feet around the heel.",
		columns: ["State", "Type", "Motion", "Spec"],
		guidanceTitle: "Do and don't",
		doTitle: "Do",
		dontTitle: "Don't",
		do: [
			"Start the new state's motion after the crossfade ends.",
			"Mirror sideways motion in right-to-left layouts.",
			"Keep the badge in place; only scale or fade it.",
			"Pause loops when the mascot leaves the screen.",
		],
		dont: [
			"Flash colours or change the drawing itself during a move.",
			"Animate more than one squadmate in a list at once.",
			"Add motion that changes the meaning of the drawing, such as a smile on Sent back.",
			"Use timers or randomness at module scope to start motion.",
		],
	},
	ar: {
		title: "حركة الشخصيات",
		lead: "يعبّر زملاء الفريق بالحركة عمّا يفعلونه. لكل حالة أداء قصير يشارك فيه الجسم والذراعان والقدمان والوجه. تضبط رموز الحركة توقيتها، وتتوقف كل حركة عند تفعيل تفضيل تقليل الحركة.",
		replay: "إعادة الحركات الفردية",
		reduce: "تقليل الحركة",
		pause: "إيقاف مؤقت",
		principlesTitle: "المبادئ",
		principlesLead: "ست قواعد تحافظ على حيوية الحركة وهدوء الواجهة.",
		principles: [
			["الحركة تعبّر عن الحالة", "لكل حالة حركة تميّزها. يجب أن تبقى الحالة واضحة في الرسم بعد إيقاف الحركة."],
			[
				"الجسم كله يشارك",
				"للقدمين والذراعين والوجه والجسم دور. ينضغط الجسم قبل القفز ويتمدد في الهواء. تدور الذراعان من الكتف وتخطو القدمان من الكعب.",
			],
			[
				"النشاط يوافق الحالة",
				"تتكرر الحالات الهادئة (الاستراحة والانتظار والإلغاء) كل ٣ إلى ٧ ثوانٍ. تتكرر حالات العمل والتحقق كل ٠٫٥ إلى ١٫٦ ثانية. التصعيد وحده لافت.",
			],
			[
				"استخدم الرموز",
				"تستخدم تغييرات الحالة `duration-enter` لمدة ٢٤٠ مللي ثانية مع `ease-enter`. تستخدم الحلقات `ease-move` ويستغرق الخروج ١٢٠ مللي ثانية عبر `duration-exit`.",
			],
			[
				"شخصية واحدة تتحرك",
				"في القائمة تتحرك الشخصية النشطة أو التي عليها التركيز. تبقى الرسوم الأخرى ثابتة. أوقف الحركة خارج الشاشة وفي علامات التبويب المخفية.",
			],
			[
				"احترم تفضيل تقليل الحركة",
				"عند تفعيل `prefers-reduced-motion` تتوقف الحركة ويظل الرسم والشارة يوضّحان الحالة. عند ٢٤ بكسل أو أقل يتحرك الوجه والشارة فقط.",
			],
		],
		statesTitle: "الحالات العشر",
		statesLead:
			"بترا في كل حالة. تستمر الحركة المتكررة طوال الحالة. تُعرض الحركة الفردية عند دخول الحالة ثم تستقر. اختر «إعادة الحركات الفردية» لرؤية حركة الإنجاز مجددًا.",
		kinds: { loop: "متكررة", once: "مرة واحدة", onceAndLoop: "مرة ثم تكرار" },
		states: {
			idle: [
				"في استراحة",
				"تنفّس والتفات وتلويح",
				"حضور ودود.",
				"ينضغط الجسم ٢٫٥٪ كل ٣ ثوانٍ. يلتفت الوجه يمينًا ويسارًا كل ٧ ثوانٍ. تلوّح الذراع اليمنى مرتين كل ٥ ثوانٍ. تحدث رمشة كل ٤٫٨ ثانية.",
			],
			waiting: [
				"بانتظارك",
				"تمايل ونقر بالقدم",
				"استعداد للمهمة التالية.",
				"يتمايل الجسم بمقدار ±٣° كل ٣٫٢ ثانية. تنقر القدم اليمنى كل ١٫١ ثانية. يلتفت الوجه كل ٦ ثوانٍ.",
			],
			planning: [
				"تخطيط",
				"تفكير ويد عند الذقن",
				"ترتيب خطوات العمل.",
				"يميل الوجه إلى أعلى ٧° خلال ٢٫٤ ثانية. ترتفع الذراع اليسرى ١٤°. تظهر نقاط التفكير بالتتابع كل ١٫٨ ثانية بفاصل ٣٠٠ مللي ثانية.",
			],
			running: [
				"قيد العمل",
				"مشي في المكان",
				"حركة أثناء العمل.",
				"يرتفع الجسم ١٢ وحدة كل ٠٫٥ ثانية. تتناوب القدمان وتتأرجح الذراعان ±١٦° كل ثانية. ينبض الظل مع الحركة.",
			],
			checking: [
				"قيد التحقق",
				"انحناء وتفحّص",
				"مراجعة دقيقة للعمل.",
				"يميل الجسم ٣–٥°. يتحرك الوجه من جانب إلى آخر كل ١٫٦ ثانية. ترفع الذراع اليمنى الأداة.",
			],
			done: [
				"تم",
				"قفز واحتفال",
				"فرحة بالإنجاز.",
				"ينضغط الجسم ثم يقفز ٧٠ وحدة ويتمدد ويهبط ويستقر خلال ١٫١ ثانية. ترتفع الذراعان ٦٠–٧٢°. تدور الشارة وتكبر ثم تستقر.",
			],
			sentback: [
				"إعادة للتعديل",
				"انحناء ثم تنهّد",
				"خيبة تليها محاولة أخرى.",
				"يرتفع الجسم قليلًا ثم ينخفض ١٠ وحدات، وتهبط الذراعان ١٢° ويميل الوجه ٦° خلال ٦٠٠ مللي ثانية. ثم يحدث تنهّد كل ٤ ثوانٍ.",
			],
			blocked: [
				"معلّق",
				"نقر بنفاد صبر",
				"انتظار تدخّل شخص.",
				"تنقر القدم اليمنى مرتين كل ٠٫٩ ثانية. تنبض الشارة مرتين كل ثانيتين.",
			],
			escalated: [
				"بانتظار قرارك",
				"تلويح لطلب المساعدة",
				"يحتاج إلى قرارك الآن.",
				"يهتز الجسم ±٩ وحدات ثم يقفز ٢٢ وحدة كل ١٫٤ ثانية. تلوّح الذراعان ±٥٠° كل ٠٫٣٥ ثانية. تتسع حلقة الشارة كل ١٫٤ ثانية.",
			],
			dropped: [
				"أُلغي",
				"شخير وإيماء الرأس",
				"نوم عميق.",
				"تنفّس عميق بنسبة ٣٫٥٪ كل ٤ ثوانٍ. ينخفض الرأس ثم يعود مرة في كل نفس. يرتفع كل حرف z ويكبر خلال ٣ ثوانٍ.",
			],
		},
		flowTitle: "تغيير الحالة",
		flowLead:
			"تمر بيزا بدورة عمل. يتلاشى الرسم السابق خلال ١٢٠ مللي ثانية ويظهر الجديد خلال ٢٤٠ مللي ثانية. تبدأ حركة الحالة الجديدة بعد انتهاء التلاشي. يبقى شكل كل وضعية كما هو.",
		flowHold: "تستمر كل خطوة في هذا العرض ٢٫٢ ثانية.",
		sizeTitle: "الحجم",
		sizeLead:
			"عند ٦٤ بكسل فأكثر يتحرك الجسم بالكامل. وتستمر الحركة نفسها في لقطة الجزء العلوي عند ٣٢ بكسل. عند ٢٤ بكسل أو أقل يتحرك الوجه والشارة فقط كي تبقى الصور في الجداول والمحادثات هادئة.",
		pixels: (size: number) => `${new Intl.NumberFormat("ar").format(size)} بكسل`,
		alarmSize: (size: number) => `بانتظار قرارك، ${new Intl.NumberFormat("ar").format(size)} بكسل`,
		specTitle: "المواصفات",
		specLead:
			"القياسات بوحدات الرسم (نحو ٦ وحدات لكل بكسل عند حجم ٦٤ بكسل). يدور الجسم حول القدمين، والذراعان حول الكتفين، والقدمان حول الكعبين.",
		columns: ["الحالة", "النوع", "الحركة", "المواصفات"],
		guidanceTitle: "ما يُنصح به وما يُتجنّب",
		doTitle: "افعل",
		dontTitle: "تجنّب",
		do: [
			"ابدأ حركة الحالة الجديدة بعد اكتمال التلاشي.",
			"اعكس الحركة الأفقية في الواجهات من اليمين إلى اليسار.",
			"أبقِ الشارة في موضعها وغيّر حجمها أو شفافيتها فقط.",
			"أوقف تكرار الحركة عندما تغادر الشخصية الشاشة.",
		],
		dont: [
			"وميض الألوان أو تبديل الرسم أثناء الحركة.",
			"تحريك أكثر من شخصية واحدة في القائمة في الوقت نفسه.",
			"إضافة حركة تغيّر معنى الرسم، مثل الابتسام عند الإعادة للتعديل.",
			"تشغيل الحركة بمؤقّت أو قيمة عشوائية عند تحميل الوحدة.",
		],
	},
} satisfies Record<
	Locale,
	{
		title: string;
		lead: string;
		replay: string;
		reduce: string;
		pause: string;
		principlesTitle: string;
		principlesLead: string;
		principles: readonly (readonly [string, string])[];
		statesTitle: string;
		statesLead: string;
		kinds: Record<LoopKind, string>;
		states: Record<AgentState, StateCopy>;
		flowTitle: string;
		flowLead: string;
		flowHold: string;
		sizeTitle: string;
		sizeLead: string;
		pixels: (size: number) => string;
		alarmSize: (size: number) => string;
		specTitle: string;
		specLead: string;
		columns: string[];
		guidanceTitle: string;
		doTitle: string;
		dontTitle: string;
		do: string[];
		dont: string[];
	}
>;
