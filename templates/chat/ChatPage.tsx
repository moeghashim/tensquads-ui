import {
	Button,
	Card,
	Chat,
	ChatAssistantMessage,
	ChatComposer,
	ChatError,
	ChatLog,
	ChatReply,
	ChatStep,
	ChatUserMessage,
	ChatWorking,
	Squadmate,
	squadmateCharacterName,
	useChat,
} from "@tensquads/ui/react";
import type { Locale } from "@tensquads/ui/schemas";

const defaults = {
	en: {
		role: "Squad lead",
		reset: "Replay",
		log: "Conversation",
		request: "Any refunds waiting?",
		reply: "Kyoto reviewed the refund queue. One case needs your instructions.",
		step: "Review refund requests",
		done: "Done",
		form: "Refund follow-up",
		note: "Instructions for Kyoto",
		submit: "Send instructions",
		recorded: "Your instructions were sent to Kyoto in this demo.",
		demoReply: "This is a sample conversation. Connect your agent to answer new questions.",
		error: "The reply could not be loaded.",
		retry: "Retry",
		suggestions: ["Any refunds waiting?", "What is low on stock?", "How did ads do this week?"],
		side: "Recent hand-offs",
		sideSubtitle: "Work Petra assigned to the squad",
		handoffs: ["Refund review", "Stock check", "Order tracking"],
	},
	ar: {
		role: "قيادة الفريق",
		reset: "إعادة العرض",
		log: "المحادثة",
		request: "هل هناك طلبات استرداد معلّقة؟",
		reply: "راجع كيوتو طلبات الاسترداد. هناك حالة واحدة تحتاج إلى توجيهك.",
		step: "مراجعة طلبات الاسترداد",
		done: "تم",
		form: "متابعة طلب الاسترداد",
		note: "تعليمات لكيوتو",
		submit: "إرسال التعليمات",
		recorded: "أُرسلت تعليماتك إلى كيوتو في هذا المثال.",
		demoReply: "هذه محادثة تجريبية. اربط وكيلك للإجابة عن الأسئلة الجديدة.",
		error: "تعذّر تحميل الرد.",
		retry: "إعادة المحاولة",
		suggestions: [
			"هل هناك طلبات استرداد معلّقة؟",
			"ما المنتجات أوشكت على النفاد؟",
			"كيف كان أداء الإعلانات هذا الأسبوع؟",
		],
		side: "آخر المهام المحالة",
		sideSubtitle: "المهام التي أحالتها بترا إلى الفريق",
		handoffs: ["مراجعة الاسترداد", "فحص المخزون", "تتبّع الطلبات"],
	},
};

const handoffAgents = ["kyoto", "giza", "pisa"] as const;

export type ChatPageProps = { locale?: Locale; copy?: typeof defaults.en; onReplay?: () => void };

export function ChatPage({ locale = "en", copy = defaults[locale], onReplay }: ChatPageProps) {
	const petra = squadmateCharacterName("petra", locale);
	const kyoto = squadmateCharacterName("kyoto", locale);
	const chat = useChat({
		endpoint: "/api/chat",
		locale,
		transport: async function* ({ turns }) {
			yield turns.at(-1)?.role === "action" ? copy.recorded : copy.demoReply;
		},
	});
	const form = `root = Form(${JSON.stringify(copy.form)}, [Field(${JSON.stringify(copy.note)}, "instructions")], ${JSON.stringify(copy.submit)}, {type: "SendRefundInstructions"})`;
	const reply = ["```openui", form, "```"].join("\n");
	const last = chat.turns.at(-1);

	return (
		<div className="template-chat">
			<Chat className="template-chat__surface" aria-label={copy.log}>
				<header className="template-chat__header">
					<Squadmate agent="petra" state="idle" size={36} locale={locale} />
					<div>
						<h1>{petra}</h1>
						<p>{copy.role}</p>
					</div>
					<Button variant="soft" size="sm" pill onClick={onReplay ?? (() => window.location.reload())}>
						{copy.reset}
					</Button>
				</header>
				<ChatLog aria-label={copy.log}>
					<ChatUserMessage>{copy.request}</ChatUserMessage>
					<ChatAssistantMessage className="template-chat__turn">
						<Squadmate agent="petra" state="idle" size={32} locale={locale} />
						<div className="template-chat__turn-body">
							<ChatStep
								name={kyoto}
								glyph={<Squadmate agent="kyoto" state="done" size={28} locale={locale} />}
								status={copy.step}
								reply={copy.done}
							/>
							<ChatReply reply={copy.reply} locale={locale} />
							<ChatReply
								reply={reply}
								locale={locale}
								isStreaming={chat.busy}
								locked={(id) => chat.locked.has(`initial/${id}`)}
								onAction={(event, id) => chat.act(event, `initial/${id}`)}
							/>
						</div>
					</ChatAssistantMessage>
					{chat.turns.map((turn, index) => {
						const id = `turn-${index}`;
						if (turn.role === "assistant")
							return (
								<ChatAssistantMessage key={id} className="template-chat__turn">
									<Squadmate agent="petra" state="idle" size={32} locale={locale} />
									<ChatReply
										reply={turn.content}
										locale={locale}
										isStreaming={chat.busy && turn === last}
										locked={(block) => chat.locked.has(`${id}/${block}`)}
										onAction={(event, block) => chat.act(event, `${id}/${block}`)}
									/>
								</ChatAssistantMessage>
							);
						return (
							<ChatUserMessage key={id}>
								{turn.role === "action" ? turn.action.summary : turn.content}
							</ChatUserMessage>
						);
					})}
					{chat.busy && last?.role !== "assistant" && (
						<ChatWorking
							locale={locale}
							glyph={<Squadmate agent="petra" state="planning" animated size={24} locale={locale} />}
						/>
					)}
					{chat.error && (
						<ChatError locale={locale} retryLabel={copy.retry} onRetry={() => void chat.retry()}>
							{copy.error}
						</ChatError>
					)}
				</ChatLog>
				<div className="template-chat__composer">
					<div className="template-chat__suggestions">
						{copy.suggestions.map((suggestion) => (
							<Button
								key={suggestion}
								pill
								variant="soft"
								size="sm"
								disabled={chat.busy}
								onClick={() => void chat.send(suggestion)}
							>
								{suggestion}
							</Button>
						))}
					</div>
					<ChatComposer
						locale={locale}
						busy={chat.busy}
						onSend={(message) => void chat.send(message)}
						onStop={chat.stop}
					/>
				</div>
			</Chat>
			<Card title={copy.side} subtitle={copy.sideSubtitle}>
				<ul className="template-chat__handoffs">
					{handoffAgents.map((agent, index) => (
						<li key={agent}>
							<Squadmate agent={agent} state="done" size={28} locale={locale} />
							<div>
								<strong>{squadmateCharacterName(agent, locale)}</strong>
								<p>{copy.handoffs[index]}</p>
							</div>
						</li>
					))}
				</ul>
			</Card>
		</div>
	);
}
