import fs from "node:fs/promises";
import path from "node:path";

const cwd = process.cwd();
const cacheDir = path.join(cwd, "content", "import-cache");

function slugify(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function buildEntries(language, rows) {
  return rows.map((row, index) => ({
    id: `${language}-${slugify(row.expression)}-${index}`,
    language,
    expression: row.expression,
    literalTranslation: row.literalTranslation,
    meaning: row.meaning,
    usageNote: row.usageNote,
    exampleSentence: row.exampleSentence,
    exampleTranslation: row.exampleTranslation,
    difficulty: row.difficulty ?? "intermediate",
    tags: row.tags ?? ["idiom", "imported", "reviewed"]
  }));
}

const recordsByLanguage = {
  da: buildEntries("da", [
    {
      expression: "Alle gode gange tre",
      literalTranslation: "All good times are three",
      meaning: "The third try often works out after earlier attempts fail.",
      usageNote: "Use it to encourage someone to try once more after two disappointing results.",
      exampleSentence: "Prøv igen, alle gode gange tre.",
      exampleTranslation: "Try again, third time is usually the lucky one.",
      difficulty: "basic"
    },
    {
      expression: "Appelsin i turbanen",
      literalTranslation: "An orange in the turban",
      meaning: "An unexpected stroke of luck.",
      usageNote: "Use it when something good happens by surprise and feels like a lucky bonus.",
      exampleSentence: "Den ekstra fridag var virkelig en appelsin i turbanen.",
      exampleTranslation: "That extra day off was a real lucky break.",
      difficulty: "intermediate"
    },
    {
      expression: "Aldrig i livet",
      literalTranslation: "Never in life",
      meaning: "Absolutely not, not under any circumstances.",
      usageNote: "Use it for a strong refusal when you want to sound emphatic and final.",
      exampleSentence: "Aldrig i livet om jeg tager det møde klokken seks om morgenen.",
      exampleTranslation: "There is no way I am taking that meeting at six in the morning.",
      difficulty: "basic"
    },
    {
      expression: "Bide i det sure æble",
      literalTranslation: "To bite into the sour apple",
      meaning: "To accept an unpleasant but necessary task.",
      usageNote: "Use it when someone stops resisting and does what has to be done anyway.",
      exampleSentence: "Jeg måtte bide i det sure æble og ringe for at beklage.",
      exampleTranslation: "I had to bite the bullet and call to apologize.",
      difficulty: "basic"
    },
    {
      expression: "Blæse en halv pelikan",
      literalTranslation: "To blow half a pelican",
      meaning: "To be blowing very hard, usually about the wind or weather.",
      usageNote: "Use it in an informal, colorful way when the weather feels rough and stormy.",
      exampleSentence: "Vi blev inde hele dagen, for det blæste en halv pelikan ved kysten.",
      exampleTranslation: "We stayed inside all day because it was blowing like crazy at the coast.",
      difficulty: "intermediate"
    },
    {
      expression: "At falde er ingen skam, men at blive liggende er",
      literalTranslation: "To fall is no shame, but to stay lying down is",
      meaning: "Making a mistake is acceptable, but refusing to recover from it is not.",
      usageNote: "Use it to motivate someone after a setback and shift the focus toward getting back up.",
      exampleSentence: "Det gik galt i dag, men at falde er ingen skam, men at blive liggende er.",
      exampleTranslation: "It went badly today, but failing is not the worst part, staying down is.",
      difficulty: "intermediate"
    },
    {
      expression: "Blod er tykkere end vand",
      literalTranslation: "Blood is thicker than water",
      meaning: "Family ties often feel stronger than other loyalties.",
      usageNote: "Use it when relatives choose each other first, even in difficult situations.",
      exampleSentence: "De skændes tit, men blod er tykkere end vand, når det virkelig gælder.",
      exampleTranslation: "They argue often, but family comes first when it really matters.",
      difficulty: "basic"
    },
    {
      expression: "Al begyndelse er svær",
      literalTranslation: "Every beginning is difficult",
      meaning: "Starting something new is usually the hardest part.",
      usageNote: "Use it to reassure someone who feels discouraged early in a learning process.",
      exampleSentence: "Bliv ved med at øve dig, al begyndelse er svær.",
      exampleTranslation: "Keep practicing, the beginning is always the hardest part.",
      difficulty: "basic"
    },
    {
      expression: "Bag skyerne er himlen altid blå",
      literalTranslation: "Behind the clouds the sky is always blue",
      meaning: "A difficult moment can still have hope behind it.",
      usageNote: "Use it to comfort someone when things feel heavy but you want to stress that the situation can improve.",
      exampleSentence: "Det ser mørkt ud nu, men bag skyerne er himlen altid blå.",
      exampleTranslation: "It looks dark right now, but there is still hope beyond it.",
      difficulty: "intermediate"
    },
    {
      expression: "Blind passager",
      literalTranslation: "Blind passenger",
      meaning: "Someone who comes along without paying or without being properly included.",
      usageNote: "Use it literally for stowaways or figuratively for people getting a free ride on others' efforts.",
      exampleSentence: "Han gled med som blind passager på projektet uden selv at bidrage.",
      exampleTranslation: "He slipped into the project like a stowaway without contributing himself.",
      difficulty: "intermediate"
    },
    {
      expression: "Dans på roser",
      literalTranslation: "A dance on roses",
      meaning: "An easy, pleasant, or trouble-free situation.",
      usageNote: "Use it most often in the negative when you want to say something is not effortless.",
      exampleSentence: "Det er ikke nogen dans på roser at starte sin egen virksomhed.",
      exampleTranslation: "Starting your own company is no walk in the park.",
      difficulty: "intermediate"
    },
    {
      expression: "By i Rusland",
      literalTranslation: "A city in Russia",
      meaning: "Something completely unfamiliar or unknown to someone.",
      usageNote: "Use it when a subject, name, or skill means absolutely nothing to the listener.",
      exampleSentence: "Regnskab er en by i Rusland for mig.",
      exampleTranslation: "Accounting is completely foreign to me.",
      difficulty: "intermediate"
    },
    {
      expression: "Blød i bolden",
      literalTranslation: "Soft in the ball",
      meaning: "Too soft-hearted or too easy to persuade.",
      usageNote: "Use it when someone gives in easily because they do not like being strict.",
      exampleSentence: "Hun siger nej først, men hun er blød i bolden og ender med at hjælpe.",
      exampleTranslation: "She says no at first, but she is soft-hearted and ends up helping.",
      difficulty: "intermediate"
    },
    {
      expression: "Bordet fanger",
      literalTranslation: "The table catches",
      meaning: "A spoken agreement counts and should be honored.",
      usageNote: "Use it when you want to remind someone that they already gave their word.",
      exampleSentence: "Du lovede at tage vagten, og bordet fanger.",
      exampleTranslation: "You promised to take the shift, and your word now counts.",
      difficulty: "intermediate"
    },
    {
      expression: "Betale prisen",
      literalTranslation: "To pay the price",
      meaning: "To suffer the consequences of a choice or mistake.",
      usageNote: "Use it when an action leads to a cost, sacrifice, or unpleasant result later on.",
      exampleSentence: "Hvis vi springer testen over nu, betaler vi prisen senere.",
      exampleTranslation: "If we skip the testing now, we will pay for it later.",
      difficulty: "basic"
    },
    {
      expression: "Bygge på sand",
      literalTranslation: "To build on sand",
      meaning: "To base something on a weak or unreliable foundation.",
      usageNote: "Use it when a plan, argument, or relationship is unstable from the start.",
      exampleSentence: "Hele strategien bygger på sand, hvis tallene ikke passer.",
      exampleTranslation: "The whole strategy rests on shaky ground if the numbers are wrong.",
      difficulty: "intermediate"
    },
    {
      expression: "Have ben i næsen",
      literalTranslation: "To have legs in the nose",
      meaning: "To be bold, determined, and not easily pushed around.",
      usageNote: "Use it to praise someone who speaks up for themselves and acts decisively.",
      exampleSentence: "Hun har ben i næsen og lod sig ikke presse i forhandlingen.",
      exampleTranslation: "She is tough and did not let herself be pushed around in the negotiation.",
      difficulty: "intermediate"
    },
    {
      expression: "Slå to fluer med ét smæk",
      literalTranslation: "To hit two flies with one swat",
      meaning: "To solve two problems with one action.",
      usageNote: "Use it when one plan gives you two useful results at once.",
      exampleSentence: "Hvis vi tager toget, kan vi besøge Anna og spare parkering, så slår vi to fluer med ét smæk.",
      exampleTranslation: "If we take the train, we can visit Anna and save on parking, so we kill two birds with one stone.",
      difficulty: "basic"
    },
    {
      expression: "Sætte næsen op efter noget",
      literalTranslation: "To set the nose after something",
      meaning: "To hope strongly for something specific.",
      usageNote: "Use it when someone has fixed their hopes on one outcome and may be disappointed if it does not happen.",
      exampleSentence: "Børnene har sat næsen op efter en tur i Tivoli i weekenden.",
      exampleTranslation: "The children have really set their hearts on a trip to Tivoli this weekend.",
      difficulty: "intermediate"
    },
    {
      expression: "Tage sorgerne på forskud",
      literalTranslation: "To take the worries in advance",
      meaning: "To worry about problems before they have actually happened.",
      usageNote: "Use it when someone is borrowing trouble instead of waiting for real evidence.",
      exampleSentence: "Du tager sorgerne på forskud, vi har ikke engang fået svaret endnu.",
      exampleTranslation: "You are worrying too early, we have not even received the answer yet.",
      difficulty: "intermediate"
    }
  ]),
  de: buildEntries("de", [
    {
      expression: "Alter schützt vor Torheit nicht",
      literalTranslation: "Age does not protect against foolishness",
      meaning: "Even experienced or older people still make foolish mistakes.",
      usageNote: "Use it when someone should have known better but still did something unwise.",
      exampleSentence: "Er hat den Link wirklich angeklickt, Alter schützt vor Torheit nicht.",
      exampleTranslation: "He really clicked that link; age does not stop people from doing foolish things.",
      difficulty: "intermediate"
    },
    {
      expression: "Aller guten Dinge sind drei",
      literalTranslation: "All good things are three",
      meaning: "The third attempt often brings success.",
      usageNote: "Use it to encourage someone to try once more after two failed attempts.",
      exampleSentence: "Versuch es noch einmal, aller guten Dinge sind drei.",
      exampleTranslation: "Try it one more time, third time is often the charm.",
      difficulty: "basic"
    },
    {
      expression: "Aus den Augen, aus dem Sinn",
      literalTranslation: "Out of the eyes, out of the mind",
      meaning: "People or things are often forgotten when they are no longer around.",
      usageNote: "Use it when distance or absence makes attention fade quickly.",
      exampleSentence: "Seit dem Umzug melden sich viele seltener, aus den Augen, aus dem Sinn.",
      exampleTranslation: "Since the move, many people check in less often; out of sight, out of mind.",
      difficulty: "intermediate"
    },
    {
      expression: "Alle Wege führen nach Rom",
      literalTranslation: "All roads lead to Rome",
      meaning: "There is more than one good way to reach the same goal.",
      usageNote: "Use it when a team is arguing over method even though several options would work.",
      exampleSentence: "Lass sie den anderen Ansatz testen, alle Wege führen nach Rom.",
      exampleTranslation: "Let them try the other approach; there is more than one way to get there.",
      difficulty: "basic"
    },
    {
      expression: "Allen Menschen recht getan, ist eine Kunst, die niemand kann",
      literalTranslation: "To please all people is an art that no one can do",
      meaning: "It is impossible to satisfy everyone.",
      usageNote: "Use it when you need to accept that some people will stay unhappy no matter what you choose.",
      exampleSentence: "Entscheide dich einfach, allen Menschen recht getan, ist eine Kunst, die niemand kann.",
      exampleTranslation: "Just make the decision; pleasing everyone is impossible.",
      difficulty: "intermediate"
    },
    {
      expression: "Alte Liebe rostet nicht",
      literalTranslation: "Old love does not rust",
      meaning: "Old affection often returns easily, even after a long time.",
      usageNote: "Use it when feelings, habits, or fondness come back surprisingly fast.",
      exampleSentence: "Nach Jahren haben sie sich wiedergetroffen und sofort gemerkt: Alte Liebe rostet nicht.",
      exampleTranslation: "They met again after years and immediately felt that old affection does not disappear easily.",
      difficulty: "intermediate"
    },
    {
      expression: "Auch ein blindes Huhn findet mal ein Korn",
      literalTranslation: "Even a blind chicken finds a grain sometimes",
      meaning: "Even an unlikely person can get something right once in a while.",
      usageNote: "Use it jokingly when someone succeeds despite low expectations.",
      exampleSentence: "Der Tipp war diesmal richtig, auch ein blindes Huhn findet mal ein Korn.",
      exampleTranslation: "That guess was right this time; even an unlikely person gets lucky now and then.",
      difficulty: "intermediate"
    },
    {
      expression: "Angriff ist die beste Verteidigung",
      literalTranslation: "Attack is the best defense",
      meaning: "Taking the initiative can protect you better than waiting passively.",
      usageNote: "Use it when being proactive is the smartest way to avoid a larger problem.",
      exampleSentence: "Wir sprechen das Risiko jetzt offen an, Angriff ist die beste Verteidigung.",
      exampleTranslation: "We are addressing the risk openly now; being proactive is our best protection.",
      difficulty: "intermediate"
    },
    {
      expression: "Aller Anfang ist schwer",
      literalTranslation: "Every beginning is hard",
      meaning: "Starting something new is usually the hardest stage.",
      usageNote: "Use it to encourage patience at the beginning of a new habit, job, or skill.",
      exampleSentence: "Bleib dran, aller Anfang ist schwer.",
      exampleTranslation: "Keep going; the beginning is always the hardest part.",
      difficulty: "basic"
    },
    {
      expression: "Asche auf mein Haupt",
      literalTranslation: "Ashes on my head",
      meaning: "I admit my fault and accept the blame.",
      usageNote: "Use it when you want to confess a mistake with a slightly dramatic or humorous tone.",
      exampleSentence: "Asche auf mein Haupt, ich habe die Datei wirklich an die falsche Gruppe geschickt.",
      exampleTranslation: "My fault entirely; I really sent the file to the wrong group.",
      difficulty: "intermediate",
      tags: ["idiom", "imported", "reviewed", "mistakes"]
    },
    {
      expression: "Armut schändet nicht",
      literalTranslation: "Poverty does not disgrace",
      meaning: "Lacking money does not make a person shameful or inferior.",
      usageNote: "Use it to defend dignity when people are judged for not having much.",
      exampleSentence: "Er hatte einfache Kleidung an, aber Armut schändet nicht.",
      exampleTranslation: "He wore simple clothes, but having little money is nothing to be ashamed of.",
      difficulty: "intermediate"
    },
    {
      expression: "Der Ton macht die Musik",
      literalTranslation: "The tone makes the music",
      meaning: "How something is said matters as much as the message itself.",
      usageNote: "Use it when someone is technically right but communicating in an unnecessarily harsh way.",
      exampleSentence: "Du hast vielleicht recht, aber der Ton macht die Musik.",
      exampleTranslation: "You may be right, but the way you say it matters.",
      difficulty: "basic"
    },
    {
      expression: "Übung macht den Meister",
      literalTranslation: "Practice makes the master",
      meaning: "Real skill comes through repeated practice.",
      usageNote: "Use it to encourage someone who is still learning and feels frustrated too early.",
      exampleSentence: "Noch klappt es nicht perfekt, aber Übung macht den Meister.",
      exampleTranslation: "It is not perfect yet, but practice is what builds real skill.",
      difficulty: "basic"
    },
    {
      expression: "Wer rastet, der rostet",
      literalTranslation: "Who rests, rusts",
      meaning: "If you stop staying active, you lose energy and sharpness.",
      usageNote: "Use it to encourage movement, practice, or curiosity instead of becoming passive.",
      exampleSentence: "Komm mit spazieren, wer rastet, der rostet.",
      exampleTranslation: "Come for a walk; if you stop moving, you lose your edge.",
      difficulty: "basic"
    },
    {
      expression: "Wo ein Wille ist, ist auch ein Weg",
      literalTranslation: "Where there is a will, there is also a way",
      meaning: "Strong determination helps people find solutions.",
      usageNote: "Use it to motivate someone who feels stuck but still has options if they keep trying.",
      exampleSentence: "Es wird schwer, aber wo ein Wille ist, ist auch ein Weg.",
      exampleTranslation: "It will be hard, but determination usually opens a path.",
      difficulty: "basic"
    },
    {
      expression: "Was du heute kannst besorgen, das verschiebe nicht auf morgen",
      literalTranslation: "What you can take care of today, do not postpone until tomorrow",
      meaning: "Do not put off a task that can already be finished now.",
      usageNote: "Use it when someone keeps delaying something small that will only become more annoying later.",
      exampleSentence: "Schick die Mail jetzt, was du heute kannst besorgen, das verschiebe nicht auf morgen.",
      exampleTranslation: "Send the email now; do not postpone what you can do today.",
      difficulty: "intermediate"
    },
    {
      expression: "Aus einer Mücke einen Elefanten machen",
      literalTranslation: "To make an elephant out of a mosquito",
      meaning: "To turn a small problem into something huge.",
      usageNote: "Use it when someone reacts far too dramatically to a minor issue.",
      exampleSentence: "Es war nur ein Tippfehler, mach nicht gleich aus einer Mücke einen Elefanten.",
      exampleTranslation: "It was only a typo; do not blow it wildly out of proportion.",
      difficulty: "intermediate"
    },
    {
      expression: "Ins Fettnäpfchen treten",
      literalTranslation: "To step into the grease bowl",
      meaning: "To say or do something socially awkward or embarrassing.",
      usageNote: "Use it when someone accidentally offends another person or raises the wrong topic at the wrong time.",
      exampleSentence: "Mit der Frage nach ihrem Gehalt ist er voll ins Fettnäpfchen getreten.",
      exampleTranslation: "By asking about her salary, he really put his foot in his mouth.",
      difficulty: "intermediate"
    },
    {
      expression: "Den roten Faden verlieren",
      literalTranslation: "To lose the red thread",
      meaning: "To lose the main point or train of thought.",
      usageNote: "Use it when speaking, writing, or planning suddenly becomes unfocused.",
      exampleSentence: "Warte kurz, ich habe gerade den roten Faden verloren.",
      exampleTranslation: "Wait a second, I just lost my train of thought.",
      difficulty: "basic"
    },
    {
      expression: "Jemandem einen Bären aufbinden",
      literalTranslation: "To tie a bear onto someone",
      meaning: "To tell someone an unbelievable story or obvious nonsense.",
      usageNote: "Use it when a person is clearly trying to fool someone with a ridiculous explanation.",
      exampleSentence: "Er wollte mir einen Bären aufbinden, aber ich habe ihm kein Wort geglaubt.",
      exampleTranslation: "He tried to feed me a ridiculous story, but I did not believe a word of it.",
      difficulty: "intermediate"
    }
  ]),
  en: buildEntries("en", [
    {
      expression: "Above and beyond",
      meaning: "Doing more than what is required or expected.",
      usageNote: "Use it to praise extra effort, especially when someone clearly exceeded the basic standard.",
      exampleSentence: "The support team went above and beyond to fix the issue before launch.",
      exampleTranslation: "The support team did much more than expected to fix the issue before launch.",
      difficulty: "basic"
    },
    {
      expression: "Above board",
      meaning: "Honest, open, and free from deception.",
      usageNote: "Use it when you want to stress that a deal, process, or action was handled transparently.",
      exampleSentence: "Everything about the agreement was above board from the start.",
      exampleTranslation: "Everything about the agreement was handled honestly from the start.",
      difficulty: "basic"
    },
    {
      expression: "About time",
      meaning: "Used to say something should have happened much earlier.",
      usageNote: "Use it when a person or result finally arrives after an irritating delay.",
      exampleSentence: "It is about time we replaced that broken laptop.",
      exampleTranslation: "We should have replaced that broken laptop a long time ago.",
      difficulty: "basic"
    },
    {
      expression: "15 minutes of fame",
      meaning: "A very short period of public attention that fades quickly.",
      usageNote: "Use it when someone becomes briefly famous and then disappears from the spotlight again.",
      exampleSentence: "The video gave him 15 minutes of fame, but people moved on by the next week.",
      exampleTranslation: "The video made him briefly famous, but the attention disappeared by the next week.",
      difficulty: "intermediate"
    },
    {
      expression: "800-pound gorilla",
      meaning: "A dominant person or organization that is hard for others to ignore.",
      usageNote: "Use it when one player in a market or conversation has overwhelming power.",
      exampleSentence: "That company is the 800-pound gorilla in the industry, so everyone reacts to its pricing.",
      exampleTranslation: "That company dominates the industry so strongly that everyone reacts to its pricing.",
      difficulty: "intermediate"
    },
    {
      expression: "A boon and a bane",
      meaning: "Something that brings both clear benefits and serious drawbacks.",
      usageNote: "Use it when a tool or change helps in one way but creates problems in another.",
      exampleSentence: "Remote work has been a boon and a bane for the team depending on the project.",
      exampleTranslation: "Remote work has been both helpful and difficult for the team depending on the project.",
      difficulty: "intermediate"
    },
    {
      expression: "11th commandment",
      meaning: "An unwritten rule that people in a group treat as if it must never be broken.",
      usageNote: "Use it when a norm feels so strong that it functions like a sacred rule.",
      exampleSentence: "In that office, replying to the founder immediately is practically the 11th commandment.",
      exampleTranslation: "In that office, replying to the founder immediately feels like an untouchable rule.",
      difficulty: "intermediate"
    },
    {
      expression: "Back to the drawing board",
      meaning: "Forced to start planning again after a failed attempt.",
      usageNote: "Use it when a solution did not work and the team has to rethink the approach from scratch.",
      exampleSentence: "The prototype kept crashing, so it was back to the drawing board.",
      exampleTranslation: "The prototype kept crashing, so we had to start planning again from scratch.",
      difficulty: "basic"
    },
    {
      expression: "Bend over backwards",
      meaning: "To make an extreme effort to help or please someone.",
      usageNote: "Use it when someone is trying very hard, sometimes too hard, to be accommodating.",
      exampleSentence: "She bent over backwards to make the guests feel comfortable.",
      exampleTranslation: "She made an exceptional effort to make the guests feel comfortable.",
      difficulty: "intermediate"
    },
    {
      expression: "By the book",
      meaning: "Following rules or official procedure very strictly.",
      usageNote: "Use it when someone cares more about correctness and compliance than flexibility.",
      exampleSentence: "The auditor does everything by the book, so sloppy records will not survive the review.",
      exampleTranslation: "The auditor follows procedure very strictly, so sloppy records will not survive the review.",
      difficulty: "intermediate"
    },
    {
      expression: "Cut corners",
      meaning: "To save time or money by doing something in a cheaper or easier but lower-quality way.",
      usageNote: "Use it when speed or cost savings cause standards to drop.",
      exampleSentence: "They cut corners during testing, and the bugs showed up in production.",
      exampleTranslation: "They used shortcuts during testing, and the bugs appeared in production.",
      difficulty: "basic"
    },
    {
      expression: "In the same boat",
      meaning: "In the same difficult situation as someone else.",
      usageNote: "Use it to build solidarity when several people are dealing with the same problem.",
      exampleSentence: "Do not panic, we are all in the same boat and we will figure it out together.",
      exampleTranslation: "Do not panic, we are all facing the same problem and will solve it together.",
      difficulty: "basic"
    },
    {
      expression: "On thin ice",
      meaning: "In a risky situation where one more mistake could cause trouble.",
      usageNote: "Use it when someone's position feels unstable and consequences are close.",
      exampleSentence: "He is already on thin ice with the client after missing two deadlines.",
      exampleTranslation: "He is already in a risky position with the client after missing two deadlines.",
      difficulty: "intermediate"
    },
    {
      expression: "Pull someone's leg",
      meaning: "To tease someone by saying something that is not meant to be taken seriously.",
      usageNote: "Use it when the joke is playful rather than genuinely misleading.",
      exampleSentence: "Relax, I was only pulling your leg about the surprise inspection.",
      exampleTranslation: "Relax, I was only teasing you about the surprise inspection.",
      difficulty: "basic"
    },
    {
      expression: "Miss the boat",
      meaning: "To be too late to take advantage of an opportunity.",
      usageNote: "Use it when hesitation or delay causes someone to lose their chance.",
      exampleSentence: "If we wait another month to apply, we might miss the boat.",
      exampleTranslation: "If we wait another month to apply, we may lose the opportunity.",
      difficulty: "basic"
    },
    {
      expression: "Let the cat out of the bag",
      meaning: "To reveal a secret earlier than intended.",
      usageNote: "Use it when someone spoils a surprise or shares confidential news too soon.",
      exampleSentence: "I was saving the announcement for dinner, but Jake let the cat out of the bag.",
      exampleTranslation: "I was saving the announcement for dinner, but Jake revealed the secret too soon.",
      difficulty: "basic"
    },
    {
      expression: "Under the gun",
      meaning: "Under intense pressure or urgent time constraints.",
      usageNote: "Use it when someone must perform quickly while feeling a lot of stress.",
      exampleSentence: "The team was under the gun all week trying to finish before the conference.",
      exampleTranslation: "The team was under heavy pressure all week trying to finish before the conference.",
      difficulty: "intermediate"
    },
    {
      expression: "Throw in the towel",
      meaning: "To give up and stop trying.",
      usageNote: "Use it when someone decides the effort is no longer worth continuing.",
      exampleSentence: "We were close to throwing in the towel before the final patch worked.",
      exampleTranslation: "We were close to giving up before the final patch worked.",
      difficulty: "basic"
    },
    {
      expression: "Costs an arm and a leg",
      meaning: "To be extremely expensive.",
      usageNote: "Use it when the price of something feels unreasonably high.",
      exampleSentence: "That apartment is beautiful, but it costs an arm and a leg.",
      exampleTranslation: "That apartment is beautiful, but it is extremely expensive.",
      difficulty: "basic"
    },
    {
      expression: "Hit the sack",
      meaning: "To go to bed or go to sleep.",
      usageNote: "Use it informally when you are tired and ready to end the day.",
      exampleSentence: "I am going to hit the sack early because tomorrow starts at five.",
      exampleTranslation: "I am going to bed early because tomorrow starts at five.",
      difficulty: "basic"
    }
  ]),
  es: buildEntries("es", [
    {
      expression: "A buenas horas",
      literalTranslation: "At a fine hour",
      meaning: "Said when help or action arrives much too late.",
      usageNote: "Use it to complain that someone finally reacted, but only after the useful moment had passed.",
      exampleSentence: "¿Ahora contestas? A buenas horas, ya lo resolvimos sin ti.",
      exampleTranslation: "Now you reply? A bit late, we already solved it without you.",
      difficulty: "intermediate"
    },
    {
      expression: "A cal y canto",
      literalTranslation: "With lime and stone",
      meaning: "Locked up very securely and completely shut.",
      usageNote: "Use it when a place or object is tightly closed and difficult to access.",
      exampleSentence: "Dejaron la oficina a cal y canto antes del puente.",
      exampleTranslation: "They left the office locked up tight before the long weekend.",
      difficulty: "intermediate"
    },
    {
      expression: "A cada rato",
      literalTranslation: "At every little while",
      meaning: "Constantly or again and again.",
      usageNote: "Use it when something keeps happening so often that it becomes noticeable or annoying.",
      exampleSentence: "Me escribe a cada rato para preguntarme si ya salí.",
      exampleTranslation: "He keeps texting me all the time to ask if I have left yet.",
      difficulty: "basic"
    },
    {
      expression: "A buenas horas mangas verdes",
      literalTranslation: "At a fine hour, green sleeves",
      meaning: "Used when help finally shows up after it is already too late to be useful.",
      usageNote: "Use it with a sharper tone than `A buenas horas` when the delay feels especially frustrating.",
      exampleSentence: "Llegó soporte cuando el servidor ya estaba caído: a buenas horas mangas verdes.",
      exampleTranslation: "Support arrived after the server was already down: far too late to help.",
      difficulty: "intermediate"
    },
    {
      expression: "A bulto",
      literalTranslation: "In bulk",
      meaning: "Roughly, approximately, or without much precision.",
      usageNote: "Use it when someone is estimating by eye instead of measuring carefully.",
      exampleSentence: "Calculamos el costo a bulto y luego afinamos los números.",
      exampleTranslation: "We estimated the cost roughly and then refined the numbers later.",
      difficulty: "intermediate"
    },
    {
      expression: "A buen seguro",
      literalTranslation: "To good certainty",
      meaning: "Almost certainly or without much doubt.",
      usageNote: "Use it when you want to sound confident about a conclusion without claiming absolute proof.",
      exampleSentence: "A buen seguro que Marta ya sabe lo que pasó.",
      exampleTranslation: "Marta almost certainly already knows what happened.",
      difficulty: "intermediate"
    },
    {
      expression: "A buen recaudo",
      literalTranslation: "In good shelter",
      meaning: "Kept safe and protected from harm or loss.",
      usageNote: "Use it when something valuable has been stored carefully or someone is finally out of danger.",
      exampleSentence: "Guardé los documentos a buen recaudo antes de la mudanza.",
      exampleTranslation: "I put the documents somewhere safe before the move.",
      difficulty: "intermediate"
    },
    {
      expression: "A base de bien",
      literalTranslation: "On a solid basis of good",
      meaning: "In a very large amount or with great intensity.",
      usageNote: "Use it informally when there is much more of something than usual.",
      exampleSentence: "En esa fiesta hubo comida a base de bien.",
      exampleTranslation: "There was plenty of food at that party.",
      difficulty: "intermediate"
    },
    {
      expression: "A brazo partido",
      literalTranslation: "With a broken arm",
      meaning: "With total effort and determination, especially in a fight or dispute.",
      usageNote: "Use it when someone is defending an idea or competing with full commitment.",
      exampleSentence: "Defendió el proyecto a brazo partido frente a todo el comité.",
      exampleTranslation: "She defended the project tooth and nail in front of the whole committee.",
      difficulty: "intermediate"
    },
    {
      expression: "A bote pronto",
      literalTranslation: "Off the bounce",
      meaning: "Immediately and without much preparation or reflection.",
      usageNote: "Use it when giving a quick reaction instead of a carefully considered answer.",
      exampleSentence: "A bote pronto diría que necesitamos más tiempo.",
      exampleTranslation: "Off the top of my head, I would say we need more time.",
      difficulty: "intermediate"
    },
    {
      expression: "A cara de perro",
      literalTranslation: "With a dog's face",
      meaning: "In a hostile, harsh, or very tense way.",
      usageNote: "Use it when a discussion or competition feels aggressive and unpleasant.",
      exampleSentence: "La negociación fue a cara de perro desde el primer minuto.",
      exampleTranslation: "The negotiation was brutally tense from the very first minute.",
      difficulty: "intermediate"
    },
    {
      expression: "A capa y espada",
      literalTranslation: "With cape and sword",
      meaning: "With fierce loyalty and complete commitment.",
      usageNote: "Use it when someone defends a person or idea with all their energy.",
      exampleSentence: "Lo defendió a capa y espada cuando empezaron las críticas.",
      exampleTranslation: "She defended him with total determination when the criticism started.",
      difficulty: "intermediate"
    },
    {
      expression: "A calzón quitado",
      literalTranslation: "With underwear removed",
      meaning: "With total frankness and without hiding anything.",
      usageNote: "Use it when someone speaks very openly about uncomfortable or personal matters.",
      exampleSentence: "Hablaron a calzón quitado sobre lo que salió mal en el equipo.",
      exampleTranslation: "They spoke with complete frankness about what went wrong on the team.",
      difficulty: "intermediate"
    },
    {
      expression: "A boca de jarro",
      literalTranslation: "At the mouth of the jar",
      meaning: "Directly, bluntly, and without warning.",
      usageNote: "Use it when a question or remark comes so suddenly that it feels abrupt.",
      exampleSentence: "Me preguntó a boca de jarro si pensaba renunciar.",
      exampleTranslation: "He asked me point-blank whether I was planning to quit.",
      difficulty: "intermediate"
    },
    {
      expression: "A campo abierto",
      literalTranslation: "In open field",
      meaning: "Out in the open, without protection or concealment.",
      usageNote: "Use it literally for open spaces or figuratively for situations with no cover.",
      exampleSentence: "No conviene discutir eso a campo abierto delante de todos.",
      exampleTranslation: "It is not wise to discuss that out in the open in front of everyone.",
      difficulty: "intermediate"
    },
    {
      expression: "A campo raso",
      literalTranslation: "On flat open land",
      meaning: "In an exposed place with no shelter around.",
      usageNote: "Use it when someone or something is left fully exposed to weather, danger, or scrutiny.",
      exampleSentence: "Nos pilló la tormenta a campo raso y no había dónde esconderse.",
      exampleTranslation: "The storm caught us in the open and there was nowhere to hide.",
      difficulty: "intermediate"
    },
    {
      expression: "A buenas",
      literalTranslation: "By the good way",
      meaning: "Calmly, willingly, or without force.",
      usageNote: "Use it when persuasion works and conflict is avoided.",
      exampleSentence: "Si lo pides a buenas, seguro que te ayudan.",
      exampleTranslation: "If you ask nicely, they will probably help you.",
      difficulty: "basic"
    },
    {
      expression: "A borbotones",
      literalTranslation: "In gushes",
      meaning: "In sudden, abundant bursts.",
      usageNote: "Use it when words, tears, ideas, or liquids come out rapidly and in large quantities.",
      exampleSentence: "Después de la noticia, las preguntas salieron a borbotones.",
      exampleTranslation: "After the news, the questions came out in a rush.",
      difficulty: "intermediate"
    },
    {
      expression: "Dar en el clavo",
      literalTranslation: "To hit the nail",
      meaning: "To get something exactly right.",
      usageNote: "Use it when someone identifies the real issue or makes the perfect remark.",
      exampleSentence: "Con ese comentario diste en el clavo.",
      exampleTranslation: "With that comment, you hit the nail on the head.",
      difficulty: "basic"
    },
    {
      expression: "Estar entre la espada y la pared",
      literalTranslation: "To be between the sword and the wall",
      meaning: "To be trapped between two difficult options.",
      usageNote: "Use it when a person has to choose between bad outcomes and cannot avoid the decision.",
      exampleSentence: "Con ese plazo estamos entre la espada y la pared.",
      exampleTranslation: "With that deadline, we are trapped between two difficult options.",
      difficulty: "intermediate"
    }
  ]),
  fr: buildEntries("fr", [
    {
      expression: "À plus tard",
      literalTranslation: "Until later",
      meaning: "A casual way to say you will see someone later.",
      usageNote: "Use it when leaving without making the goodbye feel too formal.",
      exampleSentence: "Je file à la gare, à plus tard.",
      exampleTranslation: "I am heading to the station, see you later.",
      difficulty: "basic"
    },
    {
      expression: "Acheter chat en poche",
      literalTranslation: "To buy a cat in a pocket",
      meaning: "To buy something without checking it properly first.",
      usageNote: "Use it when warning someone not to agree to a purchase blindly.",
      exampleSentence: "Sans démonstration, je ne veux pas acheter chat en poche.",
      exampleTranslation: "Without a demo, I do not want to buy it blindly.",
      difficulty: "intermediate"
    },
    {
      expression: "À votre santé",
      literalTranslation: "To your health",
      meaning: "A polite toast meaning 'cheers.'",
      usageNote: "Use it when raising a glass in a formal or polite setting.",
      exampleSentence: "À votre santé, et merci d'être venus ce soir.",
      exampleTranslation: "Cheers, and thank you for coming tonight.",
      difficulty: "basic"
    },
    {
      expression: "À la vôtre",
      literalTranslation: "To yours",
      meaning: "An informal way to say 'cheers' in a toast.",
      usageNote: "Use it with friends or in relaxed social settings when clinking glasses.",
      exampleSentence: "On a enfin fini le projet, à la vôtre.",
      exampleTranslation: "We finally finished the project, cheers everyone.",
      difficulty: "basic"
    },
    {
      expression: "Absent le chat, les souris dansent",
      literalTranslation: "When the cat is away, the mice dance",
      meaning: "People behave more freely when the authority figure is gone.",
      usageNote: "Use it when a boss, parent, or teacher leaves and discipline disappears immediately.",
      exampleSentence: "Dès que le manager est parti, absent le chat, les souris dansent.",
      exampleTranslation: "As soon as the manager left, everyone started acting freely.",
      difficulty: "intermediate"
    },
    {
      expression: "À contre-courant",
      literalTranslation: "Against the current",
      meaning: "Going against the prevailing trend or opinion.",
      usageNote: "Use it when someone deliberately chooses a different direction from the majority.",
      exampleSentence: "Il aime travailler à contre-courant quand tout le monde suit la mode.",
      exampleTranslation: "He likes to work against the trend when everyone else follows fashion.",
      difficulty: "intermediate"
    },
    {
      expression: "À la une",
      literalTranslation: "On the front page",
      meaning: "Featured as the main news or top story.",
      usageNote: "Use it when something receives the most visible public attention.",
      exampleSentence: "Le scandale était à la une pendant toute la semaine.",
      exampleTranslation: "The scandal was the headline story all week.",
      difficulty: "intermediate"
    },
    {
      expression: "À la Saint-Glinglin",
      literalTranslation: "On Saint Glinglin's day",
      meaning: "At an imaginary time that will never really come.",
      usageNote: "Use it when a promise sounds so vague that it effectively means 'never.'",
      exampleSentence: "S'il attend leur validation, ce sera pour la Saint-Glinglin.",
      exampleTranslation: "If he waits for their approval, it will happen at some imaginary never-date.",
      difficulty: "intermediate"
    },
    {
      expression: "À la bonne franquette",
      literalTranslation: "In the good French way",
      meaning: "In a simple, relaxed, and unpretentious way.",
      usageNote: "Use it for informal meals or gatherings with no ceremony or fuss.",
      exampleSentence: "On dîne à la bonne franquette ce soir, chacun apporte quelque chose.",
      exampleTranslation: "We are having a simple, relaxed dinner tonight, and everyone is bringing something.",
      difficulty: "intermediate"
    },
    {
      expression: "À l'anglaise",
      literalTranslation: "In the English way",
      meaning: "Without ceremony or quietly, often by slipping away.",
      usageNote: "Use it when someone leaves without drawing attention to their departure.",
      exampleSentence: "Il est parti à l'anglaise avant la fin de la réception.",
      exampleTranslation: "He slipped away quietly before the reception ended.",
      difficulty: "intermediate"
    },
    {
      expression: "À la fortune du pot",
      literalTranslation: "According to the luck of the pot",
      meaning: "Eating whatever simple food is available without special preparation.",
      usageNote: "Use it when inviting someone to a modest, spontaneous meal rather than a planned feast.",
      exampleSentence: "Passe ce soir, on mangera à la fortune du pot.",
      exampleTranslation: "Come by tonight and we will eat whatever simple meal is on hand.",
      difficulty: "intermediate"
    },
    {
      expression: "Poser un lapin",
      literalTranslation: "To place a rabbit",
      meaning: "To stand someone up and not show up as agreed.",
      usageNote: "Use it when a person fails to appear for a meeting without warning.",
      exampleSentence: "Il m'a posé un lapin hier soir sans même envoyer un message.",
      exampleTranslation: "He stood me up last night without even sending a message.",
      difficulty: "basic"
    },
    {
      expression: "Avoir le cafard",
      literalTranslation: "To have the cockroach",
      meaning: "To feel low, gloomy, or depressed.",
      usageNote: "Use it in casual conversation when someone is down and lacks their usual energy.",
      exampleSentence: "Depuis son départ, elle a le cafard.",
      exampleTranslation: "Since he left, she has been feeling really down.",
      difficulty: "basic"
    },
    {
      expression: "Coûter les yeux de la tête",
      literalTranslation: "To cost the eyes from the head",
      meaning: "To be extremely expensive.",
      usageNote: "Use it when something costs far more than feels reasonable.",
      exampleSentence: "Ce quartier est pratique, mais les loyers y coûtent les yeux de la tête.",
      exampleTranslation: "That neighborhood is convenient, but the rents there cost a fortune.",
      difficulty: "basic"
    },
    {
      expression: "Donner sa langue au chat",
      literalTranslation: "To give one's tongue to the cat",
      meaning: "To give up trying to guess the answer.",
      usageNote: "Use it when a riddle or question defeats you and you want the answer revealed.",
      exampleSentence: "Je donne ma langue au chat, c'était quoi la surprise ?",
      exampleTranslation: "I give up guessing, what was the surprise?",
      difficulty: "basic"
    },
    {
      expression: "Mettre les pieds dans le plat",
      literalTranslation: "To put one's feet in the dish",
      meaning: "To say something awkwardly direct that creates discomfort.",
      usageNote: "Use it when someone brings up a sensitive subject too bluntly.",
      exampleSentence: "En parlant de son divorce devant tout le monde, il a mis les pieds dans le plat.",
      exampleTranslation: "By talking about her divorce in front of everyone, he said something painfully awkward.",
      difficulty: "intermediate"
    },
    {
      expression: "Tomber dans les pommes",
      literalTranslation: "To fall into the apples",
      meaning: "To faint or pass out.",
      usageNote: "Use it in everyday speech when someone suddenly loses consciousness or nearly does.",
      exampleSentence: "Avec cette chaleur, j'ai cru qu'il allait tomber dans les pommes.",
      exampleTranslation: "With that heat, I thought he was going to faint.",
      difficulty: "basic"
    },
    {
      expression: "Avoir la tête dans les nuages",
      literalTranslation: "To have one's head in the clouds",
      meaning: "To be distracted or lost in thought.",
      usageNote: "Use it when someone is physically present but mentally somewhere else.",
      exampleSentence: "Depuis ce matin, j'ai la tête dans les nuages et j'oublie tout.",
      exampleTranslation: "Since this morning, I have been daydreaming and forgetting everything.",
      difficulty: "basic"
    },
    {
      expression: "Mettre de l'eau dans son vin",
      literalTranslation: "To put water in one's wine",
      meaning: "To become less extreme or more willing to compromise.",
      usageNote: "Use it when someone softens their demands or tone after being too rigid.",
      exampleSentence: "Après la discussion, il a mis un peu d'eau dans son vin.",
      exampleTranslation: "After the discussion, he became a bit more moderate and willing to compromise.",
      difficulty: "intermediate"
    },
    {
      expression: "Chercher midi à quatorze heures",
      literalTranslation: "To look for noon at two o'clock",
      meaning: "To overcomplicate something that is actually simple.",
      usageNote: "Use it when someone invents unnecessary complications instead of accepting the obvious solution.",
      exampleSentence: "Ne cherche pas midi à quatorze heures, la solution est déjà là.",
      exampleTranslation: "Do not overcomplicate it, the solution is already right there.",
      difficulty: "intermediate"
    }
  ]),
  it: buildEntries("it", [
    {
      expression: "A capo",
      literalTranslation: "At the head",
      meaning: "Back at the beginning or starting over from the top.",
      usageNote: "Use it when a process resets and you have to begin again instead of continuing.",
      exampleSentence: "Con quell'errore siamo tornati a capo.",
      exampleTranslation: "With that mistake, we ended up back at the beginning.",
      difficulty: "intermediate"
    },
    {
      expression: "A braccio",
      literalTranslation: "By the arm",
      meaning: "Improvised, without preparation, or done off the cuff.",
      usageNote: "Use it when someone speaks or performs spontaneously instead of following notes or a script.",
      exampleSentence: "Ha parlato a braccio per dieci minuti e se l'è cavata benissimo.",
      exampleTranslation: "He spoke off the cuff for ten minutes and handled it very well.",
      difficulty: "intermediate"
    },
    {
      expression: "A passo di lumaca",
      literalTranslation: "At a snail's pace",
      meaning: "Extremely slowly.",
      usageNote: "Use it when progress is so slow that it becomes frustrating or absurd.",
      exampleSentence: "La pratica si muove a passo di lumaca da settimane.",
      exampleTranslation: "The application has been moving at a snail's pace for weeks.",
      difficulty: "basic"
    },
    {
      expression: "A casa del diavolo",
      literalTranslation: "At the devil's house",
      meaning: "Very far away, in a remote and inconvenient place.",
      usageNote: "Use it when something feels so far away that getting there seems like a burden.",
      exampleSentence: "L'hotel era a casa del diavolo e ci abbiamo messo due ore.",
      exampleTranslation: "The hotel was in the middle of nowhere and it took us two hours to get there.",
      difficulty: "intermediate"
    },
    {
      expression: "A bocca aperta",
      literalTranslation: "With an open mouth",
      meaning: "Stunned, amazed, or left speechless.",
      usageNote: "Use it when someone reacts to surprising news or a striking performance.",
      exampleSentence: "Il finale ci ha lasciati tutti a bocca aperta.",
      exampleTranslation: "The ending left all of us completely speechless.",
      difficulty: "basic"
    },
    {
      expression: "A chiare lettere",
      literalTranslation: "In clear letters",
      meaning: "Very clearly and without ambiguity.",
      usageNote: "Use it when a message is stated directly so nobody can pretend to misunderstand it.",
      exampleSentence: "Gliel'ho scritto a chiare lettere nella mail.",
      exampleTranslation: "I wrote it to him in completely clear terms in the email.",
      difficulty: "intermediate"
    },
    {
      expression: "A gambe levate",
      literalTranslation: "With raised legs",
      meaning: "At top speed, especially while running away.",
      usageNote: "Use it when someone leaves or escapes in a great hurry.",
      exampleSentence: "Quando ha visto il cane, è scappato a gambe levate.",
      exampleTranslation: "When he saw the dog, he ran off at full speed.",
      difficulty: "intermediate"
    },
    {
      expression: "A cascata",
      literalTranslation: "Like a waterfall",
      meaning: "In a chain or cascading sequence, one thing triggering the next.",
      usageNote: "Use it when effects, decisions, or actions spread one after another.",
      exampleSentence: "Un piccolo ritardo ha creato problemi a cascata per tutta la giornata.",
      exampleTranslation: "One small delay created a cascade of problems for the whole day.",
      difficulty: "intermediate"
    },
    {
      expression: "A bocca asciutta",
      literalTranslation: "With a dry mouth",
      meaning: "Left empty-handed or disappointed after expecting something.",
      usageNote: "Use it when someone hoped for a reward or result and got nothing.",
      exampleSentence: "Aveva fatto la fila per ore ed è rimasto a bocca asciutta.",
      exampleTranslation: "He waited in line for hours and still went home empty-handed.",
      difficulty: "intermediate"
    },
    {
      expression: "A dispetto di",
      literalTranslation: "In spite of",
      meaning: "Despite something that could have prevented the result.",
      usageNote: "Use it to highlight that an outcome happened anyway, even though the circumstances were difficult.",
      exampleSentence: "A dispetto della stanchezza, ha finito il lavoro in tempo.",
      exampleTranslation: "Despite being tired, she finished the work on time.",
      difficulty: "basic"
    },
    {
      expression: "A colpi di",
      literalTranslation: "By blows of",
      meaning: "By relying heavily on one repeated means or tool.",
      usageNote: "Use it when progress happens through sheer repetition, pressure, or one dominant method.",
      exampleSentence: "Ha imparato il software a colpi di tentativi ed errori.",
      exampleTranslation: "He learned the software through repeated trial and error.",
      difficulty: "intermediate"
    },
    {
      expression: "A man bassa",
      literalTranslation: "With low hand",
      meaning: "On a large scale and with almost greedy enthusiasm.",
      usageNote: "Use it when someone grabs, buys, or collects a lot of something all at once.",
      exampleSentence: "Durante i saldi comprava libri a man bassa.",
      exampleTranslation: "During the sale, she was buying books in huge quantities.",
      difficulty: "intermediate"
    },
    {
      expression: "A freddo",
      literalTranslation: "Cold",
      meaning: "With emotional distance or after having time to cool down and think.",
      usageNote: "Use it when judging or deciding something more calmly than in the heat of the moment.",
      exampleSentence: "A freddo, mi rendo conto che aveva ragione lui.",
      exampleTranslation: "Looking at it calmly now, I realize he was right.",
      difficulty: "intermediate"
    },
    {
      expression: "A cielo aperto",
      literalTranslation: "Under open sky",
      meaning: "Outdoors and not enclosed.",
      usageNote: "Use it for events, work, or places that happen entirely in the open air.",
      exampleSentence: "Quest'estate faranno un cinema a cielo aperto nel parco.",
      exampleTranslation: "This summer they are putting on an open-air cinema in the park.",
      difficulty: "basic"
    },
    {
      expression: "A cuore aperto",
      literalTranslation: "With an open heart",
      meaning: "With complete honesty and emotional openness.",
      usageNote: "Use it when someone speaks sincerely about personal feelings or difficult truths.",
      exampleSentence: "Abbiamo parlato a cuore aperto di quello che non funzionava più.",
      exampleTranslation: "We spoke openly and honestly about what was no longer working.",
      difficulty: "intermediate"
    },
    {
      expression: "A crepapelle",
      literalTranslation: "Until the skin bursts",
      meaning: "To an extreme degree, often about laughing or eating.",
      usageNote: "Use it when the intensity is so strong that it feels exaggerated and physical.",
      exampleSentence: "Con quel video abbiamo riso a crepapelle.",
      exampleTranslation: "That video made us laugh unbelievably hard.",
      difficulty: "basic"
    },
    {
      expression: "Essere al verde",
      literalTranslation: "To be at the green",
      meaning: "To be broke or almost out of money.",
      usageNote: "Use it when someone cannot really afford new expenses right now.",
      exampleSentence: "Dopo il trasloco sono al verde fino al prossimo stipendio.",
      exampleTranslation: "After the move, I am broke until the next paycheck.",
      difficulty: "basic"
    },
    {
      expression: "Prendere due piccioni con una fava",
      literalTranslation: "To catch two pigeons with one bean",
      meaning: "To achieve two useful results with one action.",
      usageNote: "Use it when one plan solves two needs at once.",
      exampleSentence: "Se passo in centro posso comprare il regalo e vedere Luca, così prendo due piccioni con una fava.",
      exampleTranslation: "If I go downtown I can buy the gift and see Luca, so I get two things done at once.",
      difficulty: "basic"
    },
    {
      expression: "Avere le mani bucate",
      literalTranslation: "To have holes in one's hands",
      meaning: "To spend money too easily and too quickly.",
      usageNote: "Use it when someone cannot hold on to money because they keep buying things.",
      exampleSentence: "Marco ha le mani bucate: lo pagano il venerdì ed è già senza soldi lunedì.",
      exampleTranslation: "Marco spends money far too easily: he gets paid on Friday and is already short by Monday.",
      difficulty: "intermediate"
    },
    {
      expression: "Fare il passo più lungo della gamba",
      literalTranslation: "To take a step longer than the leg",
      meaning: "To take on more than you can realistically handle.",
      usageNote: "Use it when ambition outruns resources, skill, or common sense.",
      exampleSentence: "Con tre progetti insieme stiamo facendo il passo più lungo della gamba.",
      exampleTranslation: "With three projects at once, we are taking on more than we can handle.",
      difficulty: "intermediate"
    }
  ]),
  nl: buildEntries("nl", [
    {
      expression: "Af en toe",
      literalTranslation: "Off and then",
      meaning: "Now and then or occasionally.",
      usageNote: "Use it for something that happens from time to time but not very often.",
      exampleSentence: "Ik werk graag thuis, maar af en toe ga ik ook bewust naar kantoor.",
      exampleTranslation: "I like working from home, but now and then I deliberately go to the office.",
      difficulty: "basic"
    },
    {
      expression: "Achter het net vissen",
      literalTranslation: "To fish behind the net",
      meaning: "To miss out on something because you were too late or unlucky.",
      usageNote: "Use it when an opportunity goes to someone else and you end up with nothing.",
      exampleSentence: "We wilden kaartjes kopen, maar we visten achter het net.",
      exampleTranslation: "We wanted to buy tickets, but we missed out.",
      difficulty: "intermediate"
    },
    {
      expression: "Aan het kortste eind trekken",
      literalTranslation: "To pull the shortest end",
      meaning: "To end up with the worst outcome or the least favorable position.",
      usageNote: "Use it when someone gets the bad deal while others come out better.",
      exampleSentence: "Bij de verdeling trok hij weer aan het kortste eind.",
      exampleTranslation: "In the distribution, he ended up with the worst deal again.",
      difficulty: "intermediate"
    },
    {
      expression: "Aanzien des persoons",
      literalTranslation: "Regard of the person",
      meaning: "Judging people unfairly based on who they are rather than what is fair.",
      usageNote: "Use it when status, identity, or personal bias influences a decision improperly.",
      exampleSentence: "Een rechter hoort zonder aanzien des persoons te beslissen.",
      exampleTranslation: "A judge should decide without unfair bias toward the person involved.",
      difficulty: "intermediate"
    },
    {
      expression: "Achter de rug",
      literalTranslation: "Behind the back",
      meaning: "Already finished, especially something difficult or unpleasant.",
      usageNote: "Use it when you feel relief that a stressful event is now over.",
      exampleSentence: "Het examen is eindelijk achter de rug.",
      exampleTranslation: "The exam is finally behind me.",
      difficulty: "basic"
    },
    {
      expression: "Aard van het beestje",
      literalTranslation: "Nature of the little beast",
      meaning: "Someone's basic nature or the way they are built.",
      usageNote: "Use it when a habit or trait feels deeply rooted in a person's character.",
      exampleSentence: "Hij wil alles controleren, dat is gewoon de aard van het beestje.",
      exampleTranslation: "He wants to control everything; that is simply his nature.",
      difficulty: "intermediate"
    },
    {
      expression: "Aan de touwtjes trekken",
      literalTranslation: "To pull the little strings",
      meaning: "To control things behind the scenes.",
      usageNote: "Use it when the real decision-maker is not the most visible person in the room.",
      exampleSentence: "Officieel leidt zij het team, maar hij trekt aan de touwtjes.",
      exampleTranslation: "Officially she leads the team, but he is really pulling the strings.",
      difficulty: "intermediate"
    },
    {
      expression: "Alle registers opentrekken",
      literalTranslation: "To pull open all the stops",
      meaning: "To use every possible resource or effort.",
      usageNote: "Use it when someone throws everything they have into a challenge.",
      exampleSentence: "Voor die deadline moesten we alle registers opentrekken.",
      exampleTranslation: "To meet that deadline, we had to pull out all the stops.",
      difficulty: "intermediate"
    },
    {
      expression: "Academisch kwartier",
      literalTranslation: "Academic quarter hour",
      meaning: "A socially tolerated delay of about fifteen minutes.",
      usageNote: "Use it when a meeting or lecture starts a little later than the stated time and everyone accepts it.",
      exampleSentence: "De docent begon na een academisch kwartier pas met de les.",
      exampleTranslation: "The lecturer only started the class after the usual fifteen-minute academic delay.",
      difficulty: "intermediate"
    },
    {
      expression: "Achter het behang kunnen plakken",
      literalTranslation: "To be able to stick behind the wallpaper",
      meaning: "To irritate someone so much they want you out of sight.",
      usageNote: "Use it when a person is behaving in a deeply annoying way.",
      exampleSentence: "Na drie uur klagen kon ik hem wel achter het behang plakken.",
      exampleTranslation: "After three hours of complaining, he was driving me up the wall.",
      difficulty: "intermediate"
    },
    {
      expression: "Addertje onder het gras",
      literalTranslation: "A little snake under the grass",
      meaning: "A hidden problem or catch that is easy to miss at first.",
      usageNote: "Use it when an offer or plan seems fine until you notice the complication underneath.",
      exampleSentence: "Het contract zag er goed uit, maar er zat een addertje onder het gras.",
      exampleTranslation: "The contract looked good, but there was a hidden catch.",
      difficulty: "intermediate"
    },
    {
      expression: "Aan de hand zijn",
      literalTranslation: "To be at the hand",
      meaning: "To be going on or happening, often about a problem.",
      usageNote: "Use it when you sense that something is wrong and want to ask what the issue is.",
      exampleSentence: "Je kijkt zo bezorgd, wat is er aan de hand?",
      exampleTranslation: "You look so worried, what is going on?",
      difficulty: "basic"
    },
    {
      expression: "Aan het langste eind trekken",
      literalTranslation: "To pull the longest end",
      meaning: "To come out on top or with the most favorable result.",
      usageNote: "Use it when one person benefits most from the outcome.",
      exampleSentence: "Na de onderhandelingen trok de leverancier aan het langste eind.",
      exampleTranslation: "After the negotiations, the supplier came out ahead.",
      difficulty: "intermediate"
    },
    {
      expression: "Aanstalten maken",
      literalTranslation: "To make preparations",
      meaning: "To begin getting ready to do something.",
      usageNote: "Use it when the intention is visible but the action has not fully started yet.",
      exampleSentence: "Ze maakte al aanstalten om te vertrekken toen de telefoon ging.",
      exampleTranslation: "She was already making moves to leave when the phone rang.",
      difficulty: "intermediate"
    },
    {
      expression: "Advocaat van de duivel",
      literalTranslation: "Lawyer of the devil",
      meaning: "Someone who argues the opposite side to test an idea.",
      usageNote: "Use it when a person raises objections not because they agree with them, but to strengthen the discussion.",
      exampleSentence: "Ik speel even advocaat van de duivel: wat als de klant nee zegt?",
      exampleTranslation: "Let me play devil's advocate for a moment: what if the client says no?",
      difficulty: "basic"
    },
    {
      expression: "Aan de tand voelen",
      literalTranslation: "To feel someone by the tooth",
      meaning: "To question someone closely to see what they really know or intend.",
      usageNote: "Use it when you probe someone carefully rather than accepting the first answer.",
      exampleSentence: "De journalist voelde de minister flink aan de tand.",
      exampleTranslation: "The journalist questioned the minister closely.",
      difficulty: "intermediate"
    },
    {
      expression: "Achter gesloten deuren",
      literalTranslation: "Behind closed doors",
      meaning: "In private and away from public view.",
      usageNote: "Use it when something happens confidentially rather than openly.",
      exampleSentence: "De laatste onderhandelingen vonden achter gesloten deuren plaats.",
      exampleTranslation: "The final negotiations took place behind closed doors.",
      difficulty: "basic"
    },
    {
      expression: "Achter slot en grendel",
      literalTranslation: "Behind lock and bolt",
      meaning: "Locked up securely, often in prison or storage.",
      usageNote: "Use it when someone or something is kept under firm physical security.",
      exampleSentence: "Na de inbraak gingen alle waardevolle spullen achter slot en grendel.",
      exampleTranslation: "After the burglary, all valuables were locked up securely.",
      difficulty: "basic"
    },
    {
      expression: "De kat uit de boom kijken",
      literalTranslation: "To watch the cat out of the tree",
      meaning: "To wait and see before taking action.",
      usageNote: "Use it when someone prefers to observe first instead of jumping in immediately.",
      exampleSentence: "In nieuwe groepen kijkt hij eerst de kat uit de boom.",
      exampleTranslation: "In new groups, he likes to wait and see before getting involved.",
      difficulty: "intermediate"
    },
    {
      expression: "Iets door de vingers zien",
      literalTranslation: "To see something through the fingers",
      meaning: "To overlook a mistake on purpose.",
      usageNote: "Use it when someone knows a rule was broken but chooses not to enforce it.",
      exampleSentence: "De docent zag het deze keer door de vingers omdat iedereen moe was.",
      exampleTranslation: "The teacher let it slide this time because everyone was tired.",
      difficulty: "intermediate"
    }
  ]),
  pl: buildEntries("pl", [
    {
      expression: "Nie mój cyrk, nie moje małpy",
      literalTranslation: "Not my circus, not my monkeys",
      meaning: "This is not my problem or responsibility.",
      usageNote: "Use it when you want to distance yourself from chaos that someone else created.",
      exampleSentence: "Oni znowu się kłócą o budżet, ale to nie mój cyrk, nie moje małpy.",
      exampleTranslation: "They are arguing about the budget again, but that is not my problem.",
      difficulty: "basic"
    },
    {
      expression: "Bułka z masłem",
      literalTranslation: "A bread roll with butter",
      meaning: "Something very easy to do.",
      usageNote: "Use it when a task feels simple and requires little effort.",
      exampleSentence: "Dla niej ten egzamin to była bułka z masłem.",
      exampleTranslation: "For her, that exam was a piece of cake.",
      difficulty: "basic"
    },
    {
      expression: "Mieć muchy w nosie",
      literalTranslation: "To have flies in one's nose",
      meaning: "To be irritable and in a bad mood.",
      usageNote: "Use it when someone is snapping at others for no big reason.",
      exampleSentence: "Nie pytaj go teraz, ma dziś muchy w nosie.",
      exampleTranslation: "Do not ask him right now; he is in a bad mood today.",
      difficulty: "intermediate"
    },
    {
      expression: "Rzucać grochem o ścianę",
      literalTranslation: "To throw peas at the wall",
      meaning: "To speak or argue without getting any result.",
      usageNote: "Use it when your words clearly are not getting through to the other person.",
      exampleSentence: "Tłumaczenie mu zasad to jak rzucać grochem o ścianę.",
      exampleTranslation: "Explaining the rules to him is like talking to a wall.",
      difficulty: "intermediate"
    },
    {
      expression: "Mieć dwie lewe ręce",
      literalTranslation: "To have two left hands",
      meaning: "To be very clumsy or bad at practical tasks.",
      usageNote: "Use it when someone is hopeless with repairs, tools, or hands-on work.",
      exampleSentence: "Nie każ mi składać szafki, mam dwie lewe ręce.",
      exampleTranslation: "Do not ask me to assemble the cabinet; I am hopeless with practical tasks.",
      difficulty: "basic"
    },
    {
      expression: "Jak sobie pościelesz, tak się wyśpisz",
      literalTranslation: "As you make your bed, so you will sleep",
      meaning: "You have to live with the consequences of your own choices.",
      usageNote: "Use it when someone created their own problem and now has to deal with it.",
      exampleSentence: "Zignorował wszystkie ostrzeżenia, więc jak sobie pościelił, tak się wyśpi.",
      exampleTranslation: "He ignored every warning, so now he has to live with the result.",
      difficulty: "intermediate"
    },
    {
      expression: "Leje jak z cebra",
      literalTranslation: "It pours as if from a bucket",
      meaning: "It is raining extremely hard.",
      usageNote: "Use it for heavy rain that makes normal plans difficult.",
      exampleSentence: "Nie idziemy na spacer, bo leje jak z cebra.",
      exampleTranslation: "We are not going for a walk because it is pouring rain.",
      difficulty: "basic"
    },
    {
      expression: "Mieć związane ręce",
      literalTranslation: "To have tied hands",
      meaning: "To be unable to act because of restrictions.",
      usageNote: "Use it when rules, orders, or circumstances block someone from helping.",
      exampleSentence: "Chciałbym coś zmienić, ale mam związane ręce.",
      exampleTranslation: "I would like to change something, but my hands are tied.",
      difficulty: "basic"
    },
    {
      expression: "Robić z igły widły",
      literalTranslation: "To make a pitchfork out of a needle",
      meaning: "To exaggerate a small problem into something huge.",
      usageNote: "Use it when someone turns a minor issue into a dramatic crisis.",
      exampleSentence: "To tylko drobny błąd, nie rób z igły wideł.",
      exampleTranslation: "It is only a small mistake, do not make a huge drama out of it.",
      difficulty: "intermediate"
    },
    {
      expression: "Być w siódmym niebie",
      literalTranslation: "To be in the seventh heaven",
      meaning: "To be extremely happy.",
      usageNote: "Use it when someone feels delighted and emotionally on top of the world.",
      exampleSentence: "Była w siódmym niebie, kiedy dostała tę pracę.",
      exampleTranslation: "She was over the moon when she got that job.",
      difficulty: "basic"
    },
    {
      expression: "Mieć serce na dłoni",
      literalTranslation: "To have a heart on the palm",
      meaning: "To be kind, generous, and ready to help.",
      usageNote: "Use it to praise someone whose warmth shows naturally in how they treat others.",
      exampleSentence: "Ona ma serce na dłoni i zawsze znajdzie czas dla innych.",
      exampleTranslation: "She is genuinely warm-hearted and always finds time for other people.",
      difficulty: "intermediate"
    },
    {
      expression: "Mówić prosto z mostu",
      literalTranslation: "To speak straight from the bridge",
      meaning: "To speak very directly and without sugarcoating.",
      usageNote: "Use it when someone says exactly what they think without softening the message.",
      exampleSentence: "On zawsze mówi prosto z mostu, nawet jeśli to niewygodne.",
      exampleTranslation: "He always speaks very directly, even when it is uncomfortable.",
      difficulty: "intermediate"
    },
    {
      expression: "Trzymać kciuki",
      literalTranslation: "To hold thumbs",
      meaning: "To wish someone luck.",
      usageNote: "Use it before an exam, interview, competition, or any stressful moment.",
      exampleSentence: "Jutro mam rozmowę, więc trzymaj za mnie kciuki.",
      exampleTranslation: "I have an interview tomorrow, so keep your fingers crossed for me.",
      difficulty: "basic"
    },
    {
      expression: "Nawarzyć sobie piwa",
      literalTranslation: "To brew beer for oneself",
      meaning: "To create a mess that you now have to deal with yourself.",
      usageNote: "Use it when someone causes a problem through their own actions and then faces the fallout.",
      exampleSentence: "Sam sobie nawarzył piwa, więc teraz musi to posprzątać.",
      exampleTranslation: "He made this mess himself, so now he has to clean it up.",
      difficulty: "intermediate"
    },
    {
      expression: "Co ma wisieć, nie utonie",
      literalTranslation: "What is meant to hang will not drown",
      meaning: "What is destined to happen will happen anyway.",
      usageNote: "Use it when someone resigns themselves to an outcome that seems unavoidable.",
      exampleSentence: "Zobaczymy wynik jutro, co ma wisieć, nie utonie.",
      exampleTranslation: "We will see the result tomorrow; what is meant to happen will happen.",
      difficulty: "intermediate"
    },
    {
      expression: "Mieć olej w głowie",
      literalTranslation: "To have oil in the head",
      meaning: "To be sensible and think clearly.",
      usageNote: "Use it when praising someone's good judgment and common sense.",
      exampleSentence: "Spokojnie, ona ma olej w głowie i nie podpisze niczego bez czytania.",
      exampleTranslation: "Do not worry, she has good sense and will not sign anything without reading it.",
      difficulty: "intermediate"
    },
    {
      expression: "Chodzić spać z kurami",
      literalTranslation: "To go to sleep with the hens",
      meaning: "To go to bed very early.",
      usageNote: "Use it playfully when someone keeps unusually early hours.",
      exampleSentence: "Od kiedy biega rano, chodzi spać z kurami.",
      exampleTranslation: "Ever since he started running in the mornings, he goes to bed extremely early.",
      difficulty: "basic"
    },
    {
      expression: "Spuścić z tonu",
      literalTranslation: "To lower the tone",
      meaning: "To calm down and speak less aggressively.",
      usageNote: "Use it when someone needs to become less harsh, loud, or arrogant.",
      exampleSentence: "Po uwadze szefa od razu spuścił z tonu.",
      exampleTranslation: "After the boss spoke up, he immediately softened his tone.",
      difficulty: "intermediate"
    },
    {
      expression: "Wyjść jak Zabłocki na mydle",
      literalTranslation: "To end up like Zabłocki on soap",
      meaning: "To lose badly on a clever plan that backfires.",
      usageNote: "Use it when someone tries to be smart or profitable and ends up worse off than before.",
      exampleSentence: "Chciał oszczędzić na naprawie i wyszedł jak Zabłocki na mydle.",
      exampleTranslation: "He tried to save money on the repair and ended up far worse off.",
      difficulty: "intermediate"
    },
    {
      expression: "A nuż, widelec",
      literalTranslation: "Maybe, fork",
      meaning: "Maybe, just maybe, something unexpected will work out.",
      usageNote: "Use it when you are taking a small chance without much certainty.",
      exampleSentence: "Wyślę jeszcze jedno zgłoszenie, a nuż, widelec się uda.",
      exampleTranslation: "I will send one more application; maybe, just maybe, it will work out.",
      difficulty: "intermediate"
    }
  ]),
  pt: buildEntries("pt", [
    {
      expression: "A fila anda",
      literalTranslation: "The line moves on",
      meaning: "Life moves forward and you should not stay stuck in what has passed.",
      usageNote: "Use it when someone needs to accept that a chapter is over and keep going.",
      exampleSentence: "Foi triste, mas a fila anda e ele decidiu recomeçar.",
      exampleTranslation: "It was sad, but life moves on and he decided to start again.",
      difficulty: "intermediate"
    },
    {
      expression: "A caminho",
      literalTranslation: "On the way",
      meaning: "Already on the route or getting closer to happening.",
      usageNote: "Use it for people, deliveries, or results that are not here yet but are coming.",
      exampleSentence: "Calma, o relatório já está a caminho.",
      exampleTranslation: "Relax, the report is already on its way.",
      difficulty: "basic"
    },
    {
      expression: "A cereja do bolo",
      literalTranslation: "The cherry on the cake",
      meaning: "The final detail that makes something especially good.",
      usageNote: "Use it when one last addition completes an already positive situation.",
      exampleSentence: "O bônus no fim do mês foi a cereja do bolo.",
      exampleTranslation: "The bonus at the end of the month was the perfect finishing touch.",
      difficulty: "basic"
    },
    {
      expression: "A contragosto",
      literalTranslation: "Against one's taste",
      meaning: "Reluctantly and without real willingness.",
      usageNote: "Use it when someone agrees to something only because they feel they have to.",
      exampleSentence: "Ele aceitou a mudança a contragosto.",
      exampleTranslation: "He accepted the change reluctantly.",
      difficulty: "basic"
    },
    {
      expression: "A gota que transbordou o copo",
      literalTranslation: "The drop that overflowed the cup",
      meaning: "The final small problem that makes a bad situation unbearable.",
      usageNote: "Use it when patience finally runs out because one last thing pushes it too far.",
      exampleSentence: "A terceira promessa quebrada foi a gota que transbordou o copo.",
      exampleTranslation: "The third broken promise was the last straw.",
      difficulty: "intermediate"
    },
    {
      expression: "A luz no fim do túnel",
      literalTranslation: "The light at the end of the tunnel",
      meaning: "A sign that a difficult period may finally improve.",
      usageNote: "Use it when there is still hardship, but you can finally see a hopeful way forward.",
      exampleSentence: "Com esse contrato novo, começamos a ver uma luz no fim do túnel.",
      exampleTranslation: "With that new contract, we are finally seeing a light at the end of the tunnel.",
      difficulty: "basic"
    },
    {
      expression: "A portas fechadas",
      literalTranslation: "With closed doors",
      meaning: "In private and away from public view.",
      usageNote: "Use it when a conversation or decision happens confidentially.",
      exampleSentence: "A reunião decisiva aconteceu a portas fechadas.",
      exampleTranslation: "The decisive meeting happened behind closed doors.",
      difficulty: "basic"
    },
    {
      expression: "À luz de",
      literalTranslation: "In the light of",
      meaning: "Considering a fact or perspective that changes how something should be judged.",
      usageNote: "Use it to introduce relevant context before drawing a conclusion.",
      exampleSentence: "À luz dos novos dados, precisamos rever o plano.",
      exampleTranslation: "In light of the new data, we need to review the plan.",
      difficulty: "intermediate"
    },
    {
      expression: "À frente de seu tempo",
      literalTranslation: "Ahead of one's time",
      meaning: "More advanced or visionary than the period around it.",
      usageNote: "Use it for ideas or people that only get fully appreciated later.",
      exampleSentence: "Muita gente achou o projeto estranho, mas ele estava à frente de seu tempo.",
      exampleTranslation: "Many people found the project strange, but it was ahead of its time.",
      difficulty: "intermediate"
    },
    {
      expression: "A preço de banana",
      literalTranslation: "At banana price",
      meaning: "Very cheaply and far below normal value.",
      usageNote: "Use it when something is being sold for so little that it feels almost absurd.",
      exampleSentence: "Eles venderam o estoque antigo a preço de banana.",
      exampleTranslation: "They sold the old stock for next to nothing.",
      difficulty: "basic"
    },
    {
      expression: "À mão de semear",
      literalTranslation: "At hand for sowing",
      meaning: "Very easy to find or easily available.",
      usageNote: "Use it when something is close by and requires little effort to get.",
      exampleSentence: "Com tanto café à mão de semear, ninguém vai dormir na reunião.",
      exampleTranslation: "With so much coffee readily available, nobody is going to fall asleep in the meeting.",
      difficulty: "intermediate"
    },
    {
      expression: "A casa caiu",
      literalTranslation: "The house fell",
      meaning: "The trouble has arrived and the consequences can no longer be avoided.",
      usageNote: "Use it when someone's secret, mistake, or scheme has finally been exposed.",
      exampleSentence: "Quando descobriram a fraude, a casa caiu de vez.",
      exampleTranslation: "When they discovered the fraud, everything fell apart for good.",
      difficulty: "intermediate"
    },
    {
      expression: "A fio",
      literalTranslation: "In a row",
      meaning: "Continuously and without interruption.",
      usageNote: "Use it when something keeps happening for a long stretch of time.",
      exampleSentence: "Ele trabalhou dez horas a fio para terminar a entrega.",
      exampleTranslation: "He worked ten straight hours to finish the delivery.",
      difficulty: "basic"
    },
    {
      expression: "A montanha parir um rato",
      literalTranslation: "For the mountain to give birth to a mouse",
      meaning: "A huge buildup that ends in a tiny, disappointing result.",
      usageNote: "Use it when grand promises produce almost nothing in the end.",
      exampleSentence: "Falaram tanto da novidade, mas foi a montanha a parir um rato.",
      exampleTranslation: "They hyped the news so much, but it turned out to be a huge buildup for almost nothing.",
      difficulty: "intermediate"
    },
    {
      expression: "A Deus dará",
      literalTranslation: "To God will give",
      meaning: "Left to chance, without planning or control.",
      usageNote: "Use it when something is being handled in a dangerously improvised way.",
      exampleSentence: "Não dá para tocar esse projeto a Deus dará.",
      exampleTranslation: "We cannot run this project by pure chance and improvisation.",
      difficulty: "intermediate"
    },
    {
      expression: "À paisana",
      literalTranslation: "In civilian style",
      meaning: "Without a uniform or official appearance.",
      usageNote: "Use it when someone is present in plain clothes and not visibly in their formal role.",
      exampleSentence: "Os policiais estavam à paisana no evento.",
      exampleTranslation: "The police officers were at the event in plain clothes.",
      difficulty: "intermediate"
    },
    {
      expression: "A passo de caracol",
      literalTranslation: "At snail pace",
      meaning: "Very slowly.",
      usageNote: "Use it when progress is crawling and testing your patience.",
      exampleSentence: "A aprovação está andando a passo de caracol.",
      exampleTranslation: "The approval process is moving at a snail's pace.",
      difficulty: "basic"
    },
    {
      expression: "Chutar o balde",
      literalTranslation: "To kick the bucket",
      meaning: "To stop holding back and act recklessly or in total frustration.",
      usageNote: "Use it when someone suddenly stops being careful and decides not to care anymore.",
      exampleSentence: "Depois de meses de pressão, ele chutou o balde e pediu demissão.",
      exampleTranslation: "After months of pressure, he snapped and quit.",
      difficulty: "intermediate"
    },
    {
      expression: "Dar com a língua nos dentes",
      literalTranslation: "To hit the teeth with the tongue",
      meaning: "To let a secret slip.",
      usageNote: "Use it when someone reveals confidential information by accident or carelessness.",
      exampleSentence: "Eu ia fazer surpresa, mas o Pedro deu com a língua nos dentes.",
      exampleTranslation: "I was planning a surprise, but Pedro let the secret slip.",
      difficulty: "intermediate"
    },
    {
      expression: "Ficar de mãos abanando",
      literalTranslation: "To be left with waving hands",
      meaning: "To end up with nothing after expecting something.",
      usageNote: "Use it when effort or hope leads to an empty-handed result.",
      exampleSentence: "Chegamos cedo mesmo assim ficamos de mãos abanando.",
      exampleTranslation: "We arrived early and still ended up empty-handed.",
      difficulty: "intermediate"
    }
  ]),
  sv: buildEntries("sv", [
    {
      expression: "Ana ugglor i mossen",
      literalTranslation: "To sense owls in the marsh",
      meaning: "To suspect that something is not right.",
      usageNote: "Use it when details do not add up and you feel there is a hidden problem.",
      exampleSentence: "När han ändrade sin historia började jag ana ugglor i mossen.",
      exampleTranslation: "When he changed his story, I started to suspect that something was wrong.",
      difficulty: "intermediate"
    },
    {
      expression: "Aldrig i livet",
      literalTranslation: "Never in life",
      meaning: "Absolutely not, not under any circumstances.",
      usageNote: "Use it for a strong refusal when you want your answer to sound final.",
      exampleSentence: "Aldrig i livet att jag hoppar i det där iskalla vattnet.",
      exampleTranslation: "There is no way I am jumping into that freezing water.",
      difficulty: "basic"
    },
    {
      expression: "Av samma skrot och korn",
      literalTranslation: "Of the same scrap and grain",
      meaning: "Very similar in character, often in a negative way.",
      usageNote: "Use it when two people or things share the same flaws or tendencies.",
      exampleSentence: "De två cheferna är av samma skrot och korn när det gäller kontrollbehov.",
      exampleTranslation: "Those two managers are cut from the same cloth when it comes to needing control.",
      difficulty: "intermediate"
    },
    {
      expression: "Bakom lås och bom",
      literalTranslation: "Behind lock and bar",
      meaning: "Locked up securely, often in prison or behind strong security.",
      usageNote: "Use it when someone or something is kept firmly shut away.",
      exampleSentence: "Efter inbrottet låg smyckena bakom lås och bom.",
      exampleTranslation: "After the burglary, the jewelry was kept locked up securely.",
      difficulty: "basic"
    },
    {
      expression: "Av bara farten",
      literalTranslation: "Just from the momentum",
      meaning: "Almost automatically because the movement or habit was already in motion.",
      usageNote: "Use it when one action leads directly to another without much separate thought.",
      exampleSentence: "Jag gick förbi bageriet och köpte bröd av bara farten.",
      exampleTranslation: "I walked past the bakery and ended up buying bread almost automatically.",
      difficulty: "intermediate"
    },
    {
      expression: "Be tusen gånger om ursäkt",
      literalTranslation: "To apologize a thousand times",
      meaning: "To apologize very deeply and repeatedly.",
      usageNote: "Use it when someone feels strongly at fault and wants to show sincere regret.",
      exampleSentence: "Han fick be tusen gånger om ursäkt efter sitt klumpiga skämt.",
      exampleTranslation: "He had to apologize profusely after his clumsy joke.",
      difficulty: "intermediate"
    },
    {
      expression: "Bara barnet",
      literalTranslation: "Only the child",
      meaning: "Very simple or easy for someone to do.",
      usageNote: "Use it when a task feels almost embarrassingly easy to the person doing it.",
      exampleSentence: "För henne var den där analysen bara barnet.",
      exampleTranslation: "For her, that analysis was ridiculously easy.",
      difficulty: "intermediate"
    },
    {
      expression: "A och O",
      literalTranslation: "A and O",
      meaning: "The most essential part of something.",
      usageNote: "Use it when you want to stress the single most important requirement for success.",
      exampleSentence: "Tydlig kommunikation är A och O i ett distansteam.",
      exampleTranslation: "Clear communication is absolutely essential in a remote team.",
      difficulty: "basic"
    },
    {
      expression: "Alla håll och kanter",
      literalTranslation: "All directions and edges",
      meaning: "From every direction or in many different ways at once.",
      usageNote: "Use it when people, ideas, or pressure are coming at you from everywhere.",
      exampleSentence: "Frågorna kom från alla håll och kanter efter presentationen.",
      exampleTranslation: "Questions came from all directions after the presentation.",
      difficulty: "intermediate"
    },
    {
      expression: "Ha is i magen",
      literalTranslation: "To have ice in the stomach",
      meaning: "To stay calm and patient under pressure.",
      usageNote: "Use it when someone needs to avoid panicking and wait for the right moment.",
      exampleSentence: "Vi måste ha is i magen tills kunden svarar.",
      exampleTranslation: "We need to stay calm and patient until the client responds.",
      difficulty: "intermediate"
    },
    {
      expression: "Ingen ko på isen",
      literalTranslation: "No cow on the ice",
      meaning: "There is no real danger yet, so there is no need to panic.",
      usageNote: "Use it to calm someone who is worrying before the situation has actually turned serious.",
      exampleSentence: "Det är förseningar, men det är ingen ko på isen än.",
      exampleTranslation: "There are delays, but it is not a real crisis yet.",
      difficulty: "intermediate"
    },
    {
      expression: "Sitta med skägget i brevlådan",
      literalTranslation: "To sit with the beard in the mailbox",
      meaning: "To end up in an awkward mess because of your own actions.",
      usageNote: "Use it when someone gets stuck with embarrassing consequences they should have avoided.",
      exampleSentence: "Om vi lovar för mycket nu sitter vi snart med skägget i brevlådan.",
      exampleTranslation: "If we promise too much now, we will soon be stuck in an awkward mess.",
      difficulty: "intermediate"
    },
    {
      expression: "Kasta in handduken",
      literalTranslation: "To throw in the towel",
      meaning: "To give up and stop trying.",
      usageNote: "Use it when someone decides the effort is no longer worth continuing.",
      exampleSentence: "Vi var nära att kasta in handduken efter tredje felet.",
      exampleTranslation: "We were close to giving up after the third failure.",
      difficulty: "basic"
    },
    {
      expression: "Glida in på en räkmacka",
      literalTranslation: "To slide in on a shrimp sandwich",
      meaning: "To get an easy ride with unusual comfort or privilege.",
      usageNote: "Use it when someone reaches a good position without facing the usual hardship.",
      exampleSentence: "Han gled inte in på en räkmacka, han jobbade hårt för varje steg.",
      exampleTranslation: "He did not get an easy ride; he worked hard for every step.",
      difficulty: "intermediate"
    },
    {
      expression: "Nära skjuter ingen hare",
      literalTranslation: "Close does not shoot any hare",
      meaning: "Almost succeeding still does not count as success.",
      usageNote: "Use it when someone wants credit for coming close even though the goal was not reached.",
      exampleSentence: "Vi var nästan klara, men nära skjuter ingen hare.",
      exampleTranslation: "We were almost done, but almost is not the same as success.",
      difficulty: "intermediate"
    },
    {
      expression: "Få ändan ur vagnen",
      literalTranslation: "To get the backside out of the wagon",
      meaning: "To finally get moving and take action.",
      usageNote: "Use it when someone has delayed long enough and now needs to stop hesitating.",
      exampleSentence: "Nu måste vi få ändan ur vagnen och boka resan.",
      exampleTranslation: "Now we need to get moving and book the trip.",
      difficulty: "intermediate"
    },
    {
      expression: "Koka soppa på en spik",
      literalTranslation: "To cook soup from a nail",
      meaning: "To make something useful out of very little.",
      usageNote: "Use it when creativity and resourcefulness matter more than abundant resources.",
      exampleSentence: "Med den budgeten fick teamet verkligen koka soppa på en spik.",
      exampleTranslation: "With that budget, the team really had to make something out of almost nothing.",
      difficulty: "intermediate"
    },
    {
      expression: "Vara ute på hal is",
      literalTranslation: "To be out on slippery ice",
      meaning: "To be in a risky position or making claims on uncertain ground.",
      usageNote: "Use it when someone is overconfident even though the situation is unstable.",
      exampleSentence: "Om du lovar det där är du ute på hal is.",
      exampleTranslation: "If you promise that, you are on dangerous ground.",
      difficulty: "intermediate"
    },
    {
      expression: "Göra en höna av en fjäder",
      literalTranslation: "To make a hen out of a feather",
      meaning: "To exaggerate something tiny into something much bigger.",
      usageNote: "Use it when someone turns a small issue into a dramatic problem.",
      exampleSentence: "Det var bara ett missförstånd, gör inte en höna av en fjäder.",
      exampleTranslation: "It was only a misunderstanding; do not make a huge drama out of it.",
      difficulty: "intermediate"
    },
    {
      expression: "Få blodad tand",
      literalTranslation: "To get a bloodied tooth",
      meaning: "To become eager for more after an early taste of success.",
      usageNote: "Use it when one good result makes someone even more motivated to keep going.",
      exampleSentence: "Efter första försäljningen fick hon blodad tand och startade eget på riktigt.",
      exampleTranslation: "After the first sale, she got a real appetite for more and launched her business for real.",
      difficulty: "intermediate"
    }
  ])
};

async function main() {
  await fs.mkdir(cacheDir, { recursive: true });

  for (const [language, entries] of Object.entries(recordsByLanguage)) {
    const filePath = path.join(cacheDir, `${language}.json`);
    await fs.writeFile(filePath, `${JSON.stringify(entries, null, 2)}\n`, "utf8");
    console.log(`[rewrite-import-cache] wrote ${entries.length} entries to ${language}.json`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
