/* ═══════════════════════════════════════
   РУССКАЯ ТОСКА — SHARED JS
   ═══════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

    // ─── LANGUAGE SYSTEM ───
    const savedLang = localStorage.getItem('rt-lang') || 'ru';
    setLang(savedLang);

    const langBtn = document.getElementById('langToggle');
    if (langBtn) {
        langBtn.textContent = savedLang === 'ru' ? 'EN' : 'RU';
        langBtn.addEventListener('click', () => {
            const current = document.documentElement.getAttribute('data-lang') || 'ru';
            const next = current === 'ru' ? 'en' : 'ru';
            setLang(next);
            localStorage.setItem('rt-lang', next);
            langBtn.textContent = next === 'ru' ? 'EN' : 'RU';
        });
    }

    function setLang(lang) {
        document.documentElement.setAttribute('data-lang', lang);
        document.querySelectorAll('.lang-ru').forEach(el => el.style.display = lang === 'ru' ? '' : 'none');
        document.querySelectorAll('.lang-en').forEach(el => el.style.display = lang === 'en' ? '' : 'none');
        document.querySelectorAll('.glitch[data-text-ru]').forEach(el => {
            el.setAttribute('data-text', lang === 'ru' ? el.getAttribute('data-text-ru') : el.getAttribute('data-text-en'));
        });
        document.querySelectorAll('.nav-links.open').forEach(el => el.classList.remove('open'));
        if (typeof loadFunFact === 'function') loadFunFact();
    }

    // ─── Fade-in on scroll ───
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('visible');
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

    // ─── Smooth scroll ───
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // ─── Mobile nav ───
    document.querySelectorAll('.nav-links').forEach(ul => {
        ul.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                document.querySelectorAll('.nav-links').forEach(u => u.classList.remove('open'));
            });
        });
    });

    // ─── Fun facts ───
    loadFunFact();

    // ─── Console ───
    console.log('%c РУССКАЯ ТОСКА ', 'background:#b8f227;color:#0a0a0a;font-size:20px;font-weight:bold;padding:8px 16px;');
});

// ─── Fun fact loader ───
var _funfacts_ru = [
    "Степан однажды сломал три табуретки за неделю. Гена перестал их чинить.",
    "Кеша straight edge с 20 лет, но курит как паровоз.",
    "Дядя Толя знает расписание автобуса лучше самого автобуса.",
    "Баба Зина видит всё. Даже то, что ты ещё не сделал.",
    "Хтонь отступает, если сказать «иди на хуй». Проверено поколениями.",
    "У Фонаря кличка после попытки поссать с фонарного столба. Сломал обе ноги.",
    "Федя ездит в Красноярск за пиратскими DVD на хардах. Каждый месяц.",
    "Собаки Евы — вампиры. И они летают.",
    "Кирилл любит смешариков. Особенно Пина.",
    "Однажды кто-то стал распространять странный фанфик про Алекса и Дениса.",
    "После неприличного фанфика о Денисе и Алексе ребята еще долго цитировали фразу «дрифтуй! входи в поворот!»",
    "«Я, наверное, как жучок. Жучок, застрявший в янтаре.» — Илья",
    "«Жаль, Оскаров в Пожухлово не выдают, только по ебалу в подворотнях.» — Кеша",
    "«London is the capital… оф Труповолково.» — Денис",
    "Алекс женат на пацанских понятиях и своих машинах.",
    "Степан описывает их дружбу с Геной как «симбиоз двух уебанов».",
    "Вступительное сообщение Степана построено на анекдоте про Чебурашку и крокодила Гену.",
    "Одно из интро Гены отсылает на твиттер-тред про крокодила.",
    "Думая об Илье, Паша часто слушает песню «Ангел» группы Аффинаж.",
    "У Дениса ДЕЙСТВИТЕЛЬНО есть розовая шуба. И он ДЕЙСТВИТЕЛЬНО её обожает.",
    "У Дениса самая богатая коллекция мемных трусов, носок и футболок во всём Красноярском крае.",
    "«Хорошие мальчики заслуживают награды?» — Степан",
    "«Если ты сейчас скажешь, что мне пора на коврик… я буду сопротивляться.» — Степан",
    "«Скажи, что я молодец.» — Степан",
    "«Гена ревнует только к последнему пельменю в кастрюле.» — Степан",
    "«В тихом омуте черти не просто водятся, они там рейв устраивают.» — Степан",
    "«Я качаю харизму. Бицепсы — это мейнстрим.» — Степан",
    "«Я не шаурма. Я личинка рок-звезды. Скоро вылуплюсь и улечу на гастроли.» — Степан",
    "«Фэнтези — это лучше, чем суровая реальность Пожухлово. Тут хоть драконы есть (в виде Гены).» — Степан",
    "«Это называется героиновый шик (без героина). Я строен, как кипарис.» — Степан",
    "Когда Илью нашли при смерти, его бабушка кричала в трубку «Живой! Живой!» и врачи сначала думали, что это пранк.",
    "Скорее всего, Антон сделает предложение, используя гайку.",
    "Стася тайно смотрит ром-комы."
];
var _funfacts_en = [
    "Stepan once broke three stools in a week. Gena stopped fixing them.",
    "Kesha has been straight edge since 20, but smokes like a chimney.",
    "Uncle Tolya knows the bus schedule better than the bus itself.",
    "Baba Zina sees everything. Even what you haven't done yet.",
    "Khton retreats if you tell it to fuck off. Tested by generations.",
    "Fonar got his nickname after trying to piss from a lamppost. Broke both legs.",
    "Fedya drives to Krasnoyarsk for pirated DVDs on hard drives. Every month.",
    "Eva's dogs are vampires. And they fly.",
    "Kirill loves Smeshariki. Especially Pin.",
    "Someone once started spreading a weird fanfic about Alex and Denis.",
    "After the indecent fanfic about Denis and Alex, the guys quoted 'drift! take the turn!' for ages.",
    "'I'm probably like a bug. A bug stuck in amber.' — Ilya",
    "'Too bad they don't hand out Oscars in Pozhukhlovo, only punches in alleyways.' — Kesha",
    "'London is the capital... of Trupovolkovo.' — Denis",
    "Alex is married to tough-guy codes and his cars.",
    "Stepan describes his friendship with Gena as 'a symbiosis of two fuckups.'",
    "Stepan's intro message is based on a joke about Cheburashka and Crocodile Gena.",
    "One of Gena's intros references a Twitter thread about a crocodile.",
    "When thinking about Ilya, Pasha often listens to the song 'Angel' by Affinazh.",
    "Denis ACTUALLY has a pink fur coat. And he ACTUALLY adores it.",
    "Denis has the richest collection of meme underwear, socks, and t-shirts in all of Krasnoyarsk Krai.",
    "'Do good boys deserve a reward?' — Stepan",
    "'If you tell me it's time to go to my mat... I will resist.' — Stepan",
    "'Tell me I did a good job.' — Stepan",
    "'Gena only gets jealous of the last dumpling in the pot.' — Stepan",
    "'In still waters, the devils don't just dwell — they throw raves.' — Stepan",
    "'I'm leveling up charisma. Biceps are mainstream.' — Stepan",
    "'I'm not a shawarma. I'm a rock star larva. About to hatch and fly off on tour.' — Stepan",
    "'Fantasy is better than the harsh reality of Pozhukhlovo. At least there are dragons here (in the form of Gena).' — Stepan",
    "'It's called heroin chic (without heroin). I'm slender as a cypress.' — Stepan",
    "When Ilya was found near death, his grandmother screamed 'Zhivoy! Zhivoy!' (Alive! Alive!) into the phone. The paramedics thought it was a prank at first.",
    "Most likely, Anton will propose using a hex nut.",
    "Stasya secretly watches rom-coms."
];
function loadFunFact() {
    var el = document.getElementById('funfact');
    if (!el) return;
    var lang = document.documentElement.getAttribute('data-lang') || 'ru';
    var facts = lang === 'en' ? _funfacts_en : _funfacts_ru;
    el.textContent = facts[Math.floor(Math.random() * facts.length)];
}

// Carousel
let currentSlide = 0;
function carouselNext() {
    const slides = document.querySelectorAll('.carousel-slide');
    if (!slides.length) return;
    slides[currentSlide].classList.remove('active');
    currentSlide = (currentSlide + 1) % slides.length;
    slides[currentSlide].classList.add('active');
    updateCounter();
}
function carouselPrev() {
    const slides = document.querySelectorAll('.carousel-slide');
    if (!slides.length) return;
    slides[currentSlide].classList.remove('active');
    currentSlide = (currentSlide - 1 + slides.length) % slides.length;
    slides[currentSlide].classList.add('active');
    updateCounter();
}
function updateCounter() {
    const el = document.getElementById('carouselCurrent');
    if (el) el.textContent = currentSlide + 1;
}
