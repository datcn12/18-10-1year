// Everything she reads or sees comes from here. Search for "TODO:" to find what still needs personalizing.
export default {
  names: { me: "cưc", her: "em bé" },

  lock: {
    question: "cưc gọi bé là gì?",
    hint: "viết thường hết nhó",
    // base64 so the answer is not a plaintext literal. ASCII only: make a new one with btoa("...") in the browser console.
    answer: "YW1l",
  },

  reveal: { line: "Chờ chút nha..." },

  music: { src: "assets/music/bg.mp3", title: "Chờ chút..." }, // song: "Chờ chút" by CONGB

  hero: {
    src: "assets/photos/hero.jpg", // like_most.jpg
    focus: "58% 30%",
    title: "Gửi em bé Ame của iu",
    subtitle: "Nói nhỏ nè: hôm nay là ngày gì á?",
    // Film-camera date stamp in the corner of the photo: day and month only. "" hides it.
    date: "18 10",
  },

  sections: {
    story: { title: "Chuyện của chúng mình", note: "mấy lần của đôi ta hẹ hẹ" },
    gallery: { title: "Góc ảnh linh tinh", note: "vuốt qua để xem tấm khác, chạm vào để xem to" },
    letter: {
      title: "Thư cho em bé",
      note: "chạm vào con dấu để mở",
      fallback: "Lá thư hơi ngại nên trốn mất rồi, nhưng mà cưc thương em bé nhiều lắm á.",
    },
    final: {
      title: "Còn một điều nữa",
      note: "cào nhẹ nhẹ thôi nha",
      cover: "cào ở đây nè",
      // Shown once the scratch card is cleared; each answer sends hearts flying ("lots" sends many more).
      question: "mà bé có iu mình hong dạ?",
      answers: { little: "iu", lots: "iuuuuu" },
    },
  },

  // Milestones in chronological order (4-6). focus = the part of the photo that stays visible when cropped.
  // The comment after each entry is the original file in photos/.
  story: [
    { src: "assets/photos/story/01.jpg", caption: "thủy cung chao xìn", focus: "50% 40%" }, // IMG_1138
    { src: "assets/photos/story/02.jpg", caption: "18.10.2025 ngày gì thế ta", focus: "50% 30%" }, // IMG_2292
    { src: "assets/photos/story/03.jpg", caption: "ai mà xinh dạ?", focus: "50% 60%" }, // IMG_0258
    { src: "assets/photos/story/04.jpg", caption: "đây là giáng sinh nè", focus: "70% 50%" }, // IMG_5986
    { src: "assets/photos/story/05.jpg", caption: "chụp ảnh cưới hảaa", focus: "50% 90%" }, // IMG_1791
    { src: "assets/photos/story/06.jpg", caption: "mới đây hoi nhớ bé òi", focus: "50% 40%" }, // IMG_1115
  ],

  // Candid, everyday, silly moments, swiped through like a pile of instant photos. focus is optional.
  gallery: [
    { src: "assets/photos/gallery/01.jpg", caption: "mãi mới cho chụp ảnh chung đó", focus: "55% 50%" }, // B2E86AB3
    { src: "assets/photos/gallery/02.jpg", caption: "cười mãn nguyện thí", focus: "50% 45%" }, // A40AF43B
    { src: "assets/photos/gallery/03.jpg", caption: "dựa vào vai tui", focus: "50% 55%" }, // temp_image_B22F9C1A
    { src: "assets/photos/gallery/04.jpg", caption: "xùaaa", focus: "55% 50%" }, // B20B339A
    { src: "assets/photos/gallery/05.jpg", caption: "nhìn kìa ở kia chả có gì", focus: "50% 50%" }, // IMG_0471
    { src: "assets/photos/gallery/06.jpg", caption: "ngố chu mỏ ỏ ỏ ỏ", focus: "50% 30%" }, // IMG_6033
    { src: "assets/photos/gallery/07.jpg", caption: "tui bị ép hoi", focus: "60% 50%" }, // IMG_6211
    { src: "assets/photos/gallery/08.jpg", caption: "kohiiii", focus: "50% 50%" }, // IMG_6402
    { src: "assets/photos/gallery/09.jpg", caption: "trường của tụi tui", focus: "50% 70%" }, // IMG_6815
    { src: "assets/photos/gallery/10.jpg", caption: "lực sĩ ptna", focus: "52% 50%" }, // IMG_6972
    { src: "assets/photos/gallery/11.jpg", caption: "mặt bà ngố mà tóc tui đẹp hê", focus: "50% 50%" }, // IMG_7745
    { src: "assets/photos/gallery/12.jpg", caption: "ptna = 1/2 cnd à???", focus: "50% 60%" }, // IMG_9775
    { src: "assets/photos/gallery/13.jpg", caption: "cute thí", focus: "50% 70%" }, // IMG_0136
    { src: "assets/photos/gallery/14.jpg", caption: "đẹppp", focus: "38% 50%" }, // IMG_0887
    { src: "assets/photos/gallery/15.jpg", caption: "hồ tei zẻn tằng tằng zin zin", focus: "12% 50%" }, // IMG_1317
    { src: "assets/photos/gallery/19.jpg", caption: "dạo bước ở Huế", focus: "50% 85%" }, // 962A1624
    { src: "assets/photos/gallery/16.jpg", caption: "trái tim trái tim", focus: "50% 50%" }, // IMG_5661
    { src: "assets/photos/gallery/17.jpg", caption: "bỏng bỏng nước nước", focus: "68% 45%" }, // IMG_5939
    { src: "assets/photos/gallery/18.jpg", caption: "MÒAAAAAA", focus: "43% 50%" }, // IMG_0691
  ],

  // The scratch card takes this photo's own shape, so a tall photo strip shows uncropped.
  final: { src: "assets/photos/final.jpg", line: "ame iu cưc là lá la" }, // final.JPEG

  message: "assets/message/message.txt",
};
