-- ===========================================================================
-- Velvet Essence — catalogue seed
-- GENERATED FILE — edit src/data/catalog.json and run:
--     node scripts/generate-seed.mjs
-- ---------------------------------------------------------------------------
-- Requires supabase/schema.sql to have been applied first.
-- Idempotent: re-running refreshes every product in place.
-- ===========================================================================

insert into public.products (
  id, slug, name, tagline, description,
  category, collection, price, compare_at_price,
  images, variant_groups, badge,
  rating, review_count, stock,
  is_active, is_featured,
  tags, created_at
) values
(
    '0a000000-0000-4000-8000-000000000001', 'velvet-noir', 'فيلفت نوار', 'أحمر شفاه مخملي خفيف على الشفاه', 'لمسة واحدة تكفي لتغطية كاملة بلون مشبع لا يتحرّك من مكانه. زيت ثمر الورد والسكوالان يحافظان على ملمس ناعم رطب بدل المظهر الجاف، فيبدو اللون كصبغة كشميرية على الشفاه. يأتي داخل أنبوب من الذهب الوردي المصقول بإغلاق مغناطيسي.',
    'lipstick', 'لا فيلور', 27, 33,
    '["/products/lipstick-velvet-noir.svg","/collections/lipstick.svg","/hero.svg"]'::jsonb, '[{"id":"shade","label":"الدرجة","display":"swatch","options":[{"id":"vermeil","name":"فيرميّ","hex":"#C4677A","image":"/products/lipstick-petal-milk.svg","stock":24},{"id":"rose-ink","name":"روز إنك","hex":"#B76E79","image":"/products/lipstick-rose-de-maison.svg","stock":31},{"id":"nude-cashmere","name":"نيود كشمير","hex":"#C08A78","image":"/products/lipstick-nude-atelier.svg","stock":12},{"id":"velvet-noir","name":"فيلفت نوار","hex":"#7A1F2B","image":"/products/lipstick-velvet-noir.svg","stock":40},{"id":"rouge-velours","name":"روج فيلور","hex":"#B13B4B","image":"/products/lipstick-rouge-velours.svg","stock":6}]}]'::jsonb, 'الأكثر مبيعاً',
    4.9, 1284, 113,
    true, true,
    array['مطفي', 'ثابت طويلاً', 'نباتي', 'الأكثر مبيعاً', 'مخملي']::text[], '2026-08-14T09:00:00Z'
  ),
(
    '0a000000-0000-4000-8000-000000000002', 'rose-de-maison', 'روز دو ميزون', 'أحمر شفاه ساتان كريمي', 'وردة الدار، ناعمة بزبدة المورومورو حتى تمنحك تغطية ساتان مبطّنة. رأس الأنبوب مشطوف ليساعدك على التحديد دون قلم، ثم يظهر اللون بلمعة تخرج من داخل الشفاه وتناسب كل درجات البشرة.',
    'lipstick', 'لا فيلور', 26, null,
    '["/products/lipstick-rose-de-maison.svg","/collections/lipstick.svg"]'::jsonb, '[{"id":"shade","label":"الدرجة","display":"swatch","options":[{"id":"rose-ink","name":"روز إنك","hex":"#B76E79","image":"/products/lipstick-rose-de-maison.svg","stock":33},{"id":"peony-tea","name":"شاي البيوني","hex":"#D79184","image":"/products/lipstick-petal-milk.svg","stock":28},{"id":"bare-silk","name":"سيلك بيير","hex":"#C99C8E","image":"/products/lipstick-nude-atelier.svg","stock":17},{"id":"rouge-velours","name":"روج فيلور","hex":"#B13B4B","image":"/products/lipstick-rouge-velours.svg","stock":21}]}]'::jsonb, null,
    4.8, 842, 99,
    true, true,
    array['ساتان', 'مرطّب', 'نباتي', 'للاستخدام اليومي']::text[], '2026-08-21T09:00:00Z'
  ),
(
    '0a000000-0000-4000-8000-000000000003', 'nude-atelier', 'نيود أتيليه', 'أحمر شفاه بلون البشرة الطبيعي', 'تسعة أشهر من مطابقة الألوان أنتجت هذه المجموعة من درجات النيود التي تبدو كالبشرة لا كالكريم المخفي. ذرّة من مسحوق السيراميك تنعّم ملمس الشفاه، وزيت الجوجوبا المعصور على البارد يحافظ على مرونة اللون.',
    'lipstick', 'لا فيلور', 24, 28,
    '["/products/lipstick-nude-atelier.svg","/collections/lipstick.svg"]'::jsonb, '[{"id":"shade","label":"الدرجة","display":"swatch","options":[{"id":"nude-cashmere","name":"نيود كشمير","hex":"#C08A78","image":"/products/lipstick-nude-atelier.svg","stock":44},{"id":"sand-silk","name":"سيلك رملي","hex":"#D3A48F","image":"/products/lipstick-petal-milk.svg","stock":30},{"id":"spiced-fig","name":"تين متبّل","hex":"#9E5F5B","image":"/products/lipstick-rouge-velours.svg","stock":19}]}]'::jsonb, 'جديد',
    4.7, 391, 93,
    true, false,
    array['نيود', 'ناعم', 'للاستخدام اليومي', 'نباتي']::text[], '2026-09-24T09:00:00Z'
  ),
(
    '0a000000-0000-4000-8000-000000000004', 'rouge-velours', 'روج فيلور', 'أحمر شفاه عالي التصبّغ', 'الأحمر الذي عُرفنا به. قرمزي مائل للأزرق بتغطية كاملة من مرور واحد، مبطّن بزبدة الشيا حتى لا يتسرّب ولا يجفّ. تظهر درجته في الصور حقيقية تحت الإضاءة الدافئة والباردة على حد سواء.',
    'lipstick', 'لا فيلور', 27, null,
    '["/products/lipstick-rouge-velours.svg","/collections/lipstick.svg","/hero.svg"]'::jsonb, '[{"id":"shade","label":"الدرجة","display":"swatch","options":[{"id":"rouge-velours","name":"روج فيلور","hex":"#B13B4B","image":"/products/lipstick-rouge-velours.svg","stock":36},{"id":"brick-rose","name":"برِك روزيه","hex":"#9C4A44","image":"/products/lipstick-nude-atelier.svg","stock":22},{"id":"vin-noir","name":"فان نوار","hex":"#6E1F2C","image":"/products/lipstick-velvet-noir.svg","stock":14}]}]'::jsonb, 'كلاسيكي',
    4.9, 976, 72,
    true, true,
    array['أحمر', 'تصبّغ عالٍ', 'ثابت طويلاً', 'كلاسيكي']::text[], '2026-07-30T09:00:00Z'
  ),
(
    '0a000000-0000-4000-8000-000000000005', 'petal-milk', 'بتال ميلك', 'بلسم شفاه ملوّن شفّاف', 'لمن تريد لمسة لون فقط ولا شيء غيرها. خالٍ من اللانولين، بفيتامين هـ وزيت بذور التوت، يذوب على الشفاه خلال دقائق ويترك خلفه صبغة ناعمة تكفي بقية اليوم.',
    'lipstick', 'طقوس يومية', 23, null,
    '["/products/lipstick-petal-milk.svg","/collections/lipstick.svg"]'::jsonb, '[{"id":"shade","label":"اللمسة","display":"swatch","options":[{"id":"milk-petal","name":"بتلة حليب","hex":"#F0C2C4","image":"/products/lipstick-petal-milk.svg","stock":52},{"id":"rosewater","name":"ماء الورد","hex":"#D79184","image":"/products/lipstick-rose-de-maison.svg","stock":48},{"id":"berry-milk","name":"حليب التوت","hex":"#B76E79","image":"/products/lipstick-velvet-noir.svg","stock":37}]}]'::jsonb, null,
    4.6, 528, 137,
    true, false,
    array['بلسم', 'شفّاف', 'مرطّب', 'للاستخدام اليومي']::text[], '2026-06-11T09:00:00Z'
  ),
(
    '0a000000-0000-4000-8000-000000000006', 'atelier-rose-palette', 'أتيليه روزيه', 'باليت ظلال عيون من اثني عشر لوناً', 'اثنتا عشرة بتلة مضغوطة في علبة واحدة: ست درجات ساتان، وأربع معدنية، ومات كريمي اثنان. القوام زبدي وقابل للدمج دون تطاير، والمرآة كبيرة بما يكفي للاستخدام فعلاً، مع دليل الدرجات مطبوعاً داخل الغطاء.',
    'eyeshadow', 'أتيليه روزيه', 48, 58,
    '["/products/palette-atelier-rose.svg","/collections/makeup.svg","/hero.svg"]'::jsonb, '[{"id":"edition","label":"الإصدار","display":"chip","options":[{"id":"standard","name":"العلبة الأساسية","priceDelta":0,"stock":30,"caption":"١٢ لوناً"},{"id":"gift","name":"بعلبة هدية","priceDelta":8,"stock":18,"caption":"شريط وبطاقة"}]}]'::jsonb, 'اختيار المحرر',
    4.9, 1102, 48,
    true, true,
    array['باليت', 'معدني', 'مات', 'قابل للدمج', 'مرآة']::text[], '2026-08-02T09:00:00Z'
  ),
(
    '0a000000-0000-4000-8000-000000000007', 'nuit-bloomee-palette', 'باليت نوي بلوميه', 'باليت ظلال للسهرات', 'عشر درجات مبنية حول الساعة التي تلي الغروب: دخان مَوف، ولمعة بلون الدم الغامق، وقلم كريمي بلون البرقوق المسوّد. الألوان مخبوزة لا مرشوشة، لذلك تبقى اللمعة المعدنية كما هي حتى آخر قطعة.',
    'eyeshadow', 'نوي بلوميه', 51, null,
    '["/products/palette-nuit-bloomee.svg","/collections/makeup.svg"]'::jsonb, '[{"id":"edition","label":"الإصدار","display":"chip","options":[{"id":"standard","name":"العلبة الأساسية","priceDelta":0,"stock":26,"caption":"١٠ ألوان"},{"id":"gift","name":"بعلبة هدية","priceDelta":8,"stock":11,"caption":"شريط وبطاقة"}]}]'::jsonb, null,
    4.8, 634, 37,
    true, true,
    array['باليت', 'سموكي', 'للسهرات', 'لامع']::text[], '2026-09-05T09:00:00Z'
  ),
(
    '0a000000-0000-4000-8000-000000000008', 'petal-twelve', 'بتال تويلف', 'باليت درجات ناعمة للنهار', 'باليت النهار. اثنتا عشرة درجة محايدة مائلة قليلاً للدافئ، مرتّبة بحيث تشكّل أي ثلاث درجات متجاورة عيناً مكتملة. خالٍ من التلك ومضغوط بالسكوالان لقوام كريمي يتحوّل إلى بودرة.',
    'eyeshadow', 'طقوس يومية', 41, 47,
    '["/products/palette-petal-12.svg","/collections/makeup.svg"]'::jsonb, '[{"id":"edition","label":"الإصدار","display":"chip","options":[{"id":"standard","name":"العلبة الأساسية","priceDelta":0,"stock":41,"caption":"١٢ لوناً"},{"id":"gift","name":"بعلبة هدية","priceDelta":8,"stock":20,"caption":"شريط وبطاقة"}]}]'::jsonb, null,
    4.7, 458, 61,
    true, false,
    array['باليت', 'درجات محايدة', 'خالٍ من التلك', 'للاستخدام اليومي']::text[], '2026-05-19T09:00:00Z'
  ),
(
    '0a000000-0000-4000-8000-000000000009', 'gilt-bronze', 'جيلت برونز', 'باليت درجات معدنية دافئة', 'ستّ درجات برونزية بملمس المعدن السائل، مع درجة شامبانيا واحدة للإضاءة، مضغوطة وهي رطبة لتحصل على ذلك المظهر المنصهر. طبّقيها شفّافة للنهار أو بلّلي الفرشاة لمظهر معدني كامل للسهرة.',
    'eyeshadow', 'أتيليه روزيه', 45, null,
    '["/products/palette-gilt-bronze.svg","/collections/makeup.svg"]'::jsonb, '[{"id":"edition","label":"الإصدار","display":"chip","options":[{"id":"standard","name":"العلبة الأساسية","priceDelta":0,"stock":24,"caption":"٧ ألوان"},{"id":"gift","name":"بعلبة هدية","priceDelta":8,"stock":8,"caption":"شريط وبطاقة"}]}]'::jsonb, 'إصدار محدود',
    4.8, 287, 32,
    true, false,
    array['معدني', 'برونزي', 'إصدار محدود', 'مطلي']::text[], '2026-09-30T09:00:00Z'
  ),
(
    '0a000000-0000-4000-8000-000000000010', 'powder-flush', 'باودر فلاش', 'بلاشر بودرة حريري', 'مطحون سبع مرات ليختفي في البشرة ولا يترك سوى اللون. يُبنى من نفخة وردية خفيفة إلى توهّج كامل بلمسة السبعينات، دون أي طبشور ودون لمعة.',
    'blush', 'طقوس يومية', 30, null,
    '["/products/blush-powder-flush.svg","/collections/makeup.svg"]'::jsonb, '[{"id":"shade","label":"الدرجة","display":"swatch","options":[{"id":"first-flush","name":"أول توهّج","hex":"#E5A3A8","image":"/products/blush-powder-flush.svg","stock":34},{"id":"rosewood","name":"روزوود","hex":"#B76E79","image":"/products/blush-silk-rosewood.svg","stock":26},{"id":"apricot-veil","name":"مشمش ناعم","hex":"#E9B18E","image":"/products/blush-cream-peony.svg","stock":19}]}]'::jsonb, 'الأكثر مبيعاً',
    4.8, 712, 79,
    true, true,
    array['بلاشر', 'بودرة', 'قابل للبناء', 'مات']::text[], '2026-07-08T09:00:00Z'
  ),
(
    '0a000000-0000-4000-8000-000000000011', 'cream-peony', 'بلاشر بيوني', 'بلاشر كريمي مخفوق', 'كريم مخفوق يذوب عند اللمس ويتحوّل إلى بودرة ناعمة عند وضعه. دفّئيه بأطراف أصابعك واضغطيه على الوجنتين للحصول على توهّج يشبه دوران الدم لا مستحضرات التجميل.',
    'blush', 'طقوس يومية', 28, 34,
    '["/products/blush-cream-peony.svg","/collections/makeup.svg"]'::jsonb, '[{"id":"shade","label":"الدرجة","display":"swatch","options":[{"id":"peony","name":"بيوني","hex":"#D79184","image":"/products/blush-cream-peony.svg","stock":31},{"id":"petal-milk","name":"بتلة حليب","hex":"#F0C2C4","image":"/products/blush-powder-flush.svg","stock":28},{"id":"fig-leaf","name":"ورق التين","hex":"#A9636E","image":"/products/blush-silk-rosewood.svg","stock":12}]}]'::jsonb, null,
    4.7, 486, 71,
    true, false,
    array['كريمي', 'إشراق', 'نباتي', 'بأطراف الأصابع']::text[], '2026-06-27T09:00:00Z'
  ),
(
    '0a000000-0000-4000-8000-000000000012', 'silk-rosewood', 'سيلك روزوود', 'دوات للتحديد والإشراق', 'علبة فنية من درجتين: روزوود بارد للنحت، وسيلك دافئ للرفع، يفصلهما شريط معدني رقيق. صُمّمت لتُخلطا معاً على فرشاة واحدة للحصول على نتيجة بدرجة واحدة.',
    'blush', 'أتيليه روزيه', 33, null,
    '["/products/blush-silk-rosewood.svg","/collections/makeup.svg"]'::jsonb, '[{"id":"shade","label":"الدوات","display":"swatch","options":[{"id":"rosewood-silk","name":"روزوود / سيلك","hex":"#B76E79","image":"/products/blush-silk-rosewood.svg","stock":22},{"id":"clay-linen","name":"طيني / كتاني","hex":"#B5826F","image":"/products/blush-cream-peony.svg","stock":15}]}]'::jsonb, 'جديد',
    4.6, 174, 37,
    true, false,
    array['دوات', 'نحت', 'كونتور', 'احترافي']::text[], '2026-09-18T09:00:00Z'
  ),
(
    '0a000000-0000-4000-8000-000000000013', 'nuit-bloomee-eau-de-parfum', 'نوي بلوميه', 'أو دو بارفان — توقيع الدار', 'عطر الدار الأساسي. يفتح الياسمين المتفتّح ليلاً على الورد التركي والدمسون، ثم يستقرّ على العنبر الدافئ وحبّ التونكا وذرّة من خشب الأرز. مركّب في غراس ومتروك ينضج ستة أسابيع قبل التعبئة.',
    'fragrance', 'نوي بلوميه', 105, null,
    '["/products/flacon-nuit-bloomee.svg","/collections/perfume.svg","/hero.svg"]'::jsonb, '[{"id":"size","label":"الحجم","display":"chip","options":[{"id":"30ml","name":"30 مل","priceDelta":0,"stock":24,"caption":"حجم السفر"},{"id":"50ml","name":"50 مل","priceDelta":38,"stock":31,"caption":"الحجم الأساسي"},{"id":"100ml","name":"100 مل","priceDelta":92,"stock":9,"caption":"حجم كبير"}]}]'::jsonb, 'التوقيع',
    5, 1436, 64,
    true, true,
    array['زهري', 'عنبر', 'ياسمين', 'للسهرات', 'غراس']::text[], '2026-04-02T09:00:00Z'
  ),
(
    '0a000000-0000-4000-8000-000000000014', 'rose-ambre', 'روز أمبري', 'أو دو بارفان', 'ورد سنتيفوليا مقطّر عند الفجر، ملفوف ببذور الأمبريت وفانيليا بطيئة. عطر دافئ قريب من البشرة وفخم بهدوء — ذاك الذي يميل الناس نحوك ليعرفوا ما هو.',
    'fragrance', 'نوي بلوميه', 94, 112,
    '["/products/flacon-rose-ambre.svg","/collections/perfume.svg"]'::jsonb, '[{"id":"size","label":"الحجم","display":"chip","options":[{"id":"30ml","name":"30 مل","priceDelta":0,"stock":27,"caption":"حجم السفر"},{"id":"50ml","name":"50 مل","priceDelta":33,"stock":22,"caption":"الحجم الأساسي"},{"id":"100ml","name":"100 مل","priceDelta":80,"stock":6,"caption":"حجم كبير"}]}]'::jsonb, null,
    4.8, 692, 55,
    true, true,
    array['ورد', 'عنبر', 'فانيليا', 'دافئ', 'رومانسي']::text[], '2026-05-28T09:00:00Z'
  ),
(
    '0a000000-0000-4000-8000-000000000015', 'oud-velours', 'عود فيلور', 'إكستريه دو بارفان', 'قراءة متحفّظة للعود: خشب لاوسي مهدّأ بالزعفران والبرقوق الأسود ومخمل من البنزوين. مركّز بنسبة 28٪، وأفضل ما يُستخدم على ياقة المعطف.',
    'fragrance', 'نوي بلوميه', 132, null,
    '["/products/flacon-oud-velours.svg","/collections/perfume.svg"]'::jsonb, '[{"id":"size","label":"الحجم","display":"chip","options":[{"id":"15ml","name":"15 مل","priceDelta":0,"stock":30,"caption":"إكستريه"},{"id":"50ml","name":"50 مل","priceDelta":118,"stock":14,"caption":"الحجم الأساسي"}]}]'::jsonb, 'إصدار محدود',
    4.9, 321, 44,
    true, false,
    array['عود', 'إكستريه', 'خشبي', 'زعفران', 'للجنسين']::text[], '2026-09-12T09:00:00Z'
  ),
(
    '0a000000-0000-4000-8000-000000000016', 'fleur-dawn-mist', 'فلير دون', 'ميست للشعر والجسم', 'غطاء صباحي ناعم من النيرولي وزهر الكمثرى والمسك الأبيض، مع مركّب بانثينول يعتني بالشعر. خفيف بما يكفي لإعادة رشّه في العمل دون أن يملأ المكان.',
    'fragrance', 'طقوس يومية', 38, null,
    '["/products/mist-fleur-dawn.svg","/collections/perfume.svg"]'::jsonb, '[{"id":"size","label":"الحجم","display":"chip","options":[{"id":"100ml","name":"100 مل","priceDelta":0,"stock":46,"caption":"للاستخدام اليومي"},{"id":"200ml","name":"200 مل","priceDelta":18,"stock":21,"caption":"إعادة تعبئة"}]}]'::jsonb, null,
    4.6, 407, 67,
    true, false,
    array['ميست', 'نيرولي', 'منعش', 'للشعر', 'يومي']::text[], '2026-07-21T09:00:00Z'
  ),
(
    '0a000000-0000-4000-8000-000000000017', 'lumiere-blanche', 'لوميير بلانش', 'أو دو بارفان', 'مشرق ونظيف وبودري قليلاً: برغموت وسوسن على شامواه بيضاء وأثر من خشب جوز الهند. الخيار الأول للعرائس، وأكثر ما يُطلب منّا على الكاونتر.',
    'fragrance', 'أتيليه روزيه', 110, 126,
    '["/products/flacon-lumiere-blanche.svg","/collections/perfume.svg"]'::jsonb, '[{"id":"size","label":"الحجم","display":"chip","options":[{"id":"30ml","name":"30 مل","priceDelta":0,"stock":25,"caption":"حجم السفر"},{"id":"50ml","name":"50 مل","priceDelta":39,"stock":29,"caption":"الحجم الأساسي"},{"id":"100ml","name":"100 مل","priceDelta":95,"stock":12,"caption":"حجم كبير"}]}]'::jsonb, 'الأكثر مبيعاً',
    4.9, 874, 66,
    true, true,
    array['سوسن', 'شامواه', 'نظيف', 'للعرائس', 'بودري']::text[], '2026-06-04T09:00:00Z'
  ),
(
    '0a000000-0000-4000-8000-000000000018', 'cedre-blanc-mist', 'سيدر بلان', 'ميست للشعر والجسم', 'ورق الأرز والتين المجفّف ورشّة من ملح البحر. بروح مشتركة بين الجنسين، يُركَّب بجمال تحت روز أمبري ويختفي في المكان دون أن يعلن عن نفسه.',
    'fragrance', 'طقوس يومية', 41, null,
    '["/products/mist-cedre-blanc.svg","/collections/perfume.svg"]'::jsonb, '[{"id":"size","label":"الحجم","display":"chip","options":[{"id":"100ml","name":"100 مل","priceDelta":0,"stock":38,"caption":"للاستخدام اليومي"},{"id":"200ml","name":"200 مل","priceDelta":18,"stock":17,"caption":"إعادة تعبئة"}]}]'::jsonb, null,
    4.7, 289, 55,
    true, false,
    array['أرز', 'تين', 'للجنسين', 'منعش', 'للتركيب']::text[], '2026-08-27T09:00:00Z'
  ),
(
    '0a000000-0000-4000-8000-000000000019', 'glasshouse-glow-serum', 'سيروم غلاسهاوس غلو', 'سيروم نياسيناميد وفيتامين سي', 'سيروم يومي خفيف بنسبة 10٪ نياسيناميد و3٪ فيتامين سي ثابت وثلاثي من الهيالورونيك. أثبت سريرياً توحيد لون البشرة خلال أربع أسابيع، بدرجة حموضة تتحمّلها بشرتك دون تهيّج.',
    'skincare', 'غلاسهاوس', 61, 70,
    '["/products/serum-glasshouse-glow.svg","/collections/skincare.svg"]'::jsonb, '[{"id":"size","label":"الحجم","display":"chip","options":[{"id":"30ml","name":"30 مل","priceDelta":0,"stock":42,"caption":"يكفي ٦ أسابيع"},{"id":"50ml","name":"50 مل","priceDelta":25,"stock":24,"caption":"أفضل قيمة"}]}]'::jsonb, 'الأكثر طلباً',
    4.9, 2138, 66,
    true, true,
    array['سيروم', 'نياسيناميد', 'فيتامين سي', 'إشراقة', 'مختبر جلدياً']::text[], '2026-03-15T09:00:00Z'
  ),
(
    '0a000000-0000-4000-8000-000000000020', 'rosewater-dew-serum', 'سيروم ماء الورد', 'سيروم مرطّب بماء الورد الدمشقي', 'ماء ورد دمشقي، وحمض البوليغلوتاميك، والبيتا غلوكان في تركيبة جيل تحفظ الماء في البشرة اثنتي عشرة ساعة. بارد عند اللمس، مثالي تحت المكياج وبعد التعرّض للشمس.',
    'skincare', 'غلاسهاوس', 55, null,
    '["/products/serum-rosewater-dew.svg","/collections/skincare.svg"]'::jsonb, '[{"id":"size","label":"الحجم","display":"chip","options":[{"id":"30ml","name":"30 مل","priceDelta":0,"stock":36,"caption":"يكفي ٦ أسابيع"},{"id":"50ml","name":"50 مل","priceDelta":22,"stock":19,"caption":"أفضل قيمة"}]}]'::jsonb, null,
    4.8, 946, 55,
    true, false,
    array['ترطيب', 'ورد', 'مهدّئ', 'للتركيب']::text[], '2026-05-06T09:00:00Z'
  ),
(
    '0a000000-0000-4000-8000-000000000021', 'nuit-balm', 'نوي بالم', 'بالم ليلي لترميم البشرة', 'بالم ليلي كثيف لكن يتنفّس، من السيراميد والسكوالان والبانثينول، يحبس كل ما وضعته تحته. تستيقظين ببشرة ممتلئة من جديد لا مغطّاة بطبقة ثقيلة.',
    'skincare', 'نوي بلوميه', 44, null,
    '["/products/jar-nuit-balm.svg","/collections/skincare.svg"]'::jsonb, '[{"id":"size","label":"الحجم","display":"chip","options":[{"id":"50ml","name":"50 مل","priceDelta":0,"stock":40,"caption":"برطمان"},{"id":"100ml","name":"100 مل","priceDelta":25,"stock":16,"caption":"عبوة إعادة تعبئة"}]}]'::jsonb, null,
    4.8, 558, 56,
    true, false,
    array['بالم', 'سيراميد', 'ليلي', 'حاجز البشرة', 'بدون عطر']::text[], '2026-07-14T09:00:00Z'
  ),
(
    '0a000000-0000-4000-8000-000000000022', 'peony-cream', 'كريم بيوني', 'كريم نهاري خفيف', 'كريم نهاري مخفوق ببيبتيد-6 ومستخلص جذر البيوني، بلمسة نهائية تنعّم البشرة وتعمل كقاعدة تحت المكياج. يتشرّب خلال أقل من دقيقة دون أي إحساس سليكوني.',
    'skincare', 'غلاسهاوس', 50, 57,
    '["/products/jar-peony-cream.svg","/collections/skincare.svg"]'::jsonb, '[{"id":"size","label":"الحجم","display":"chip","options":[{"id":"50ml","name":"50 مل","priceDelta":0,"stock":44,"caption":"برطمان"},{"id":"100ml","name":"100 مل","priceDelta":28,"stock":18,"caption":"عبوة إعادة تعبئة"}]}]'::jsonb, 'جديد',
    4.7, 412, 62,
    true, false,
    array['مرطّب', 'ببتيدات', 'قاعدة مكياج', 'نهاري', 'خفيف']::text[], '2026-09-08T09:00:00Z'
  ),
(
    '0a000000-0000-4000-8000-000000000023', 'vitamin-silk-serum', 'فيتامين سيلك', 'سيروم لترميم حاجز البشرة', 'سيروم هادئ وحليبي للبشرة الحساسة: 5٪ بانثينول، ودهون الشوفان، ومزيج سيراميد في قاعدة خالية من العطر. صُمّم للأسبوع الذي يلي جلسة علاج أو تفاعل مزعج.',
    'skincare', 'غلاسهاوس', 52, null,
    '["/products/serum-vitamin-silk.svg","/collections/skincare.svg"]'::jsonb, '[{"id":"size","label":"الحجم","display":"chip","options":[{"id":"30ml","name":"30 مل","priceDelta":0,"stock":39,"caption":"يكفي ٦ أسابيع"},{"id":"50ml","name":"50 مل","priceDelta":20,"stock":15,"caption":"أفضل قيمة"}]}]'::jsonb, null,
    4.8, 367, 54,
    true, false,
    array['حاجز البشرة', 'للبشرة الحساسة', 'بدون عطر', 'بانثينول']::text[], '2026-06-19T09:00:00Z'
  ),
(
    '0a000000-0000-4000-8000-000000000024', 'bloom-tonic-mist', 'تونيك بلوم', 'ميست تونيك مقشّر يومي', 'تونيك حمضي يومي بنسبة 4٪ حمض اللاكتيك، ولحاء الصفصاف، والغليسرين. رشّة واحدة بعد التنظيف، بلا قطن وبلا لسعة — فقط بشرة أصفى وأكثر نعومة يوماً بعد يوم.',
    'skincare', 'غلاسهاوس', 34, null,
    '["/products/mist-tonic-bloom.svg","/collections/skincare.svg"]'::jsonb, '[{"id":"size","label":"الحجم","display":"chip","options":[{"id":"100ml","name":"100 مل","priceDelta":0,"stock":48,"caption":"للاستخدام اليومي"},{"id":"200ml","name":"200 مل","priceDelta":17,"stock":22,"caption":"إعادة تعبئة"}]}]'::jsonb, null,
    4.6, 523, 70,
    true, false,
    array['تونيك', 'حمض اللاكتيك', 'مقشّر', 'تجديد']::text[], '2026-08-09T09:00:00Z'
  )
on conflict (id) do update set
  slug             = excluded.slug,
  name             = excluded.name,
  tagline          = excluded.tagline,
  description      = excluded.description,
  category         = excluded.category,
  collection       = excluded.collection,
  price            = excluded.price,
  compare_at_price = excluded.compare_at_price,
  images           = excluded.images,
  variant_groups   = excluded.variant_groups,
  badge            = excluded.badge,
  rating           = excluded.rating,
  review_count     = excluded.review_count,
  stock            = excluded.stock,
  is_active        = excluded.is_active,
  is_featured      = excluded.is_featured,
  tags             = excluded.tags;

-- ---------------------------------------------------------------------------
-- Promote your first administrator (replace the address, then re-run):
--
--   update public.profiles set role = 'admin' where email = 'you@example.com';
-- ---------------------------------------------------------------------------
