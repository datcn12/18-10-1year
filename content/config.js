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

  music: { src: "assets/music/bg.mp3", title: "Chờ chút", artist: "CONGB" },

  hero: {
    src: "assets/photos/hero.jpg", // like_most.jpg
    focus: "58% 30%",
    title: "Gửi em bé của iu",
    subtitle: "Nói nhỏ nè: tui iu ame lắm á",
    // Film-camera date stamp in the corner of the photo: day and month only. "" hides it.
    date: "18 10",
  },

  sections: {
    story: { title: "Chuyện của mình", note: "mấy lần của đôi ta hẹ hẹ" },
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
      question: "bé có iu mình hong dạ?",
      answers: { little: "iu", lots: "iuuuuu" },
    },
  },

  // Milestones in chronological order (4-6). focus = the part of the photo that stays visible when cropped.
  // The comment after each entry is the original file in photos/.
  story: [
    { src: "assets/photos/story/01.jpg", caption: "TODO: những ngày đầu của tụi mình", focus: "50% 40%" }, // IMG_1138
    { src: "assets/photos/story/02.jpg", caption: "TODO: ngày em gật đầu", focus: "50% 30%" }, // IMG_2292
    { src: "assets/photos/story/03.jpg", caption: "TODO: chuyến đi lên núi", focus: "50% 60%" }, // IMG_0258
    { src: "assets/photos/story/04.jpg", caption: "TODO: Giáng sinh của tụi mình", focus: "70% 50%" }, // IMG_5986
    { src: "assets/photos/story/05.jpg", caption: "TODO: chuyến đi Huế", focus: "50% 90%" }, // IMG_1791
    { src: "assets/photos/story/06.jpg", caption: "TODO: và còn nhiều chương nữa", focus: "50% 40%" }, // IMG_1115
  ],

  // Candid, everyday, silly moments, swiped through like a pile of instant photos. focus is optional.
  gallery: [
    { src: "assets/photos/gallery/01.jpg", caption: "TODO: bó hoa bên hồ", focus: "55% 50%" }, // B2E86AB3
    { src: "assets/photos/gallery/02.jpg", caption: "TODO: em bé dựa vai cưc", focus: "50% 45%" }, // A40AF43B
    { src: "assets/photos/gallery/03.jpg", caption: "TODO: buổi tối bình yên", focus: "50% 55%" }, // temp_image_B22F9C1A
    { src: "assets/photos/gallery/04.jpg", caption: "TODO: selfie dưới hàng cây", focus: "55% 50%" }, // B20B339A
    { src: "assets/photos/gallery/05.jpg", caption: "TODO: ngồi ngắm núi", focus: "50% 50%" }, // IMG_0471
    { src: "assets/photos/gallery/06.jpg", caption: "TODO: mặt ngố của em bé", focus: "50% 30%" }, // IMG_6033
    { src: "assets/photos/gallery/07.jpg", caption: "TODO: cưc hôn gió nè", focus: "60% 50%" }, // IMG_6211
    { src: "assets/photos/gallery/08.jpg", caption: "TODO: hai đứa trong khung ảnh", focus: "50% 50%" }, // IMG_6402
    { src: "assets/photos/gallery/09.jpg", caption: "TODO: chụp ở trường", focus: "50% 70%" }, // IMG_6815
    { src: "assets/photos/gallery/10.jpg", caption: "TODO: đi dã ngoại", focus: "52% 50%" }, // IMG_6972
    { src: "assets/photos/gallery/11.jpg", caption: "TODO: selfie trong thang máy", focus: "50% 50%" }, // IMG_7745
    { src: "assets/photos/gallery/12.jpg", caption: "TODO: ngồi trên tường đá", focus: "50% 60%" }, // IMG_9775
    { src: "assets/photos/gallery/13.jpg", caption: "TODO: ôm một cái", focus: "50% 70%" }, // IMG_0136
    { src: "assets/photos/gallery/14.jpg", caption: "TODO: thơm má em bé", focus: "38% 50%" }, // IMG_0887
    { src: "assets/photos/gallery/15.jpg", caption: "TODO: chạy xe vòng hồ", focus: "12% 50%" }, // IMG_1317
    { src: "assets/photos/gallery/16.jpg", caption: "TODO: trái tim to đùng", focus: "50% 50%" }, // IMG_5661
    { src: "assets/photos/gallery/17.jpg", caption: "TODO: đi chơi cuối tuần", focus: "68% 45%" }, // IMG_5939
    { src: "assets/photos/gallery/18.jpg", caption: "TODO: soi gương chụp hình", focus: "43% 50%" }, // IMG_0691
  ],

  final: { src: "assets/photos/final.jpg", focus: "50% 85%", line: "TODO: câu cuối cưc muốn nói với em bé" }, // 962A1624

  message: "assets/message/message.txt",
};
