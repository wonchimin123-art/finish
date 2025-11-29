import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  MapPin,
  Navigation,
  Info,
  Users,
  Calendar,
  X,
  Star,
  TrendingUp,
  Eye,
  ThumbsUp,
  MessageCircle,
  Send,
  Plus,
  Edit,
  Trash,
  LogIn,
  LogOut,
  Camera,
  Image as ImageIcon,
  ArrowLeft,
} from "lucide-react";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInAnonymously,
  signInWithCustomToken,
  onAuthStateChanged,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  onSnapshot,
  setDoc,
  increment,
  getDoc,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
  query,
  orderBy,
} from "firebase/firestore";

// ============================================================================
// [필수 수정 영역] Firebase 설정
// 본인의 Firebase 프로젝트 설정으로 교체해야 실제 저장이 됩니다.
// 교체하지 않으면 '체험 모드'로 동작하며 데이터가 새로고침 시 사라질 수 있습니다.
// ============================================================================
const MY_FIREBASE_CONFIG = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
};

// 환경 변수 처리 (안전한 접근)
const firebaseConfig =
  typeof __firebase_config !== "undefined"
    ? JSON.parse(__firebase_config)
    : MY_FIREBASE_CONFIG;

const appId = typeof __app_id !== "undefined" ? __app_id : "default-app-id";
// ============================================================================

// Firebase 초기화 (에러 방지 래퍼)
let app, auth, db;
try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} catch (e) {
  console.warn("Firebase 초기화 실패 (체험 모드로 동작합니다):", e);
}

// Date utility
const getTodayDateString = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getHourKey = (offsetHours = 0) => {
  const date = new Date();
  date.setHours(date.getHours() + offsetHours);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hour = String(date.getHours()).padStart(2, "0");
  return `${year}-${month}-${day}-${hour}`;
};

// Initial Data (Enhanced Descriptions)
const initialDistrictsData = [
  {
    id: "1",
    name: "소제동 카페거리",
    description:
      "대전역 동광장을 빠져나와 횡단보도 하나만 건너면 거짓말처럼 시간이 멈춘 마을이 나타납니다. 낡은 기와지붕 위로 나른하게 하품하는 고양이가 보이고, 좁은 골목 사이로 향긋한 커피 볶는 냄새가 바람을 타고 흘러옵니다. 직접 걸어본 소제동은 단순한 '카페 거리'가 아니었습니다. 100년 전 철도 관사로 쓰이던 목조 건물들이 뼈대만 남긴 채 통유리로 마감되어, 과거와 현재가 기묘하게 공존하는 독특한 분위기를 자아냅니다.\n\n특히 비가 오는 날 처마 끝에서 떨어지는 빗소리를 들으며 마시는 차 한 잔은 그야말로 낭만 그 자체였습니다. SNS에서 핫한 '온천집'의 하얀 모래 정원은 마치 교토의 어느 료칸에 와 있는 듯한 착각을 불러일으키고, 대나무 숲이 우거진 '풍뉴가'에서는 바람에 흔들리는 대나무 소리가 ASMR처럼 들려옵니다. 겉은 페인트가 벗겨져 허름해 보이지만, 문을 열고 들어서는 순간 펼쳐지는 반전 매력 가득한 인테리어는 셔터를 멈출 수 없게 만듭니다. 주말 점심에는 웨이팅이 꽤 있는 편이니, 오픈런을 하거나 브레이크 타임 직후를 노리는 것이 팁입니다. 뚜벅이 여행자라면 대전역에 도착하자마자 캐리어를 끌고 가장 먼저 달려가야 할 곳, 바로 소제동입니다.",
    tags: ["카페", "사진명소", "데이트", "뉴트로", "뚜벅이추천"],
    image:
      "https://images.unsplash.com/photo-1596627622998-150992383188?auto=format&fit=crop&q=80&w=800",
    district: "동구",
    views: 1205,
    rating: 4.5,
  },
  {
    id: "2",
    name: "식장산 전망대",
    description:
      "대전의 야경을 논할 때 절대 빼놓을 수 없는 곳, 바로 식장산입니다. 꼬불꼬불한 산길을 차로 15분 정도 오르다 보면 어느새 해발 598m 정상 부근에 도착합니다. 차에서 내리자마자 탁 트인 시야와 함께 시원한 산바람이 뺨을 스치는데, 그 상쾌함은 이루 말할 수 없습니다. 해가 지기 전 도착해 붉게 물드는 노을부터 감상하는 것을 강력 추천합니다. 서서히 어둠이 깔리고 도심의 건물들이 하나둘 불을 밝히기 시작하면, 마치 검은 융단 위에 보석을 흩뿌린 듯한 환상적인 야경이 눈앞에 펼쳐집니다.\n\n전망대에 세워진 전통 누각 '식장루'에 오르면 더욱 운치 있는 풍경을 즐길 수 있습니다. 이곳에서 바라보는 대전 시내는 평평한 평지 위에 반듯하게 구획된 도시의 불빛들이 기하학적인 아름다움을 뽐냅니다. 늦은 밤, 답답한 마음을 뻥 뚫어버리고 싶거나 사랑하는 사람과 로맨틱한 분위기를 잡고 싶다면 식장산 야경만 한 선택지가 없습니다. 정상에는 매점이 하나 있는데, 야경을 보며 먹는 컵라면 맛은 그야말로 '미슐랭 3스타' 부럽지 않습니다. 단, 올라가는 길이 좁고 가로등이 적어 초보 운전자라면 각별한 주의가 필요합니다.",
    tags: ["야경", "드라이브", "전망대", "일몰", "데이트코스"],
    image:
      "https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&q=80&w=800",
    district: "동구",
    views: 980,
    rating: 4.8,
  },
  {
    id: "3",
    name: "대동 하늘공원",
    description:
      "가파른 언덕길을 따라 오밀조밀 모여 있는 달동네가 알록달록한 벽화마을로 변신했습니다. 숨을 헐떡이며 언덕을 오르다 보면, 어느새 대전 시내가 발아래 펼쳐지는 대동 하늘공원에 도착합니다. 이곳의 랜드마크인 빨간 풍차 앞에서 내려다보는 풍경은 화려한 빌딩 숲의 야경과는 다른, 사람 냄새 나는 따뜻한 감동을 줍니다. 옹기종기 모여 있는 주택들의 불빛이 마치 땅 위의 별처럼 반짝이는 모습은 '대전의 몽마르트'라는 별명이 아깝지 않을 정도로 아름답습니다.\n\n특히 노을이 질 때 방문하면 핑크빛으로 물드는 하늘과 마을의 조화가 절경을 이룹니다. 공원까지 올라가는 길 골목골목마다 그려진 아기자기한 벽화들과 '연애바위' 같은 소소한 볼거리가 있어 지루할 틈이 없습니다. 근처에는 전망 좋은 루프탑 카페들이 많은데, 창가 자리에 앉아 따뜻한 차 한 잔을 마시며 야경을 멍하니 바라보는 것만으로도 하루의 피로가 싹 가시는 기분입니다. 식장산이 웅장한 파노라마라면, 대동 하늘공원은 소박하고 아늑한 감성이 가득한 곳입니다. 썸 타는 사이라면 이곳에서 고백 성공률 200%를 장담합니다.",
    tags: ["일몰", "산책", "벽화마을", "풍차", "사진찍기좋은곳"],
    image:
      "https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?auto=format&fit=crop&q=80&w=800",
    district: "동구",
    views: 845,
    rating: 4.6,
  },
  {
    id: "4",
    name: "성심당 본점",
    description:
      "대전은 몰라도 성심당은 안다는 말이 있을 정도로, 성심당은 이제 단순한 빵집을 넘어 대전의 상징이자 자부심이 되었습니다. 은행동 본점에 들어서는 순간, 갓 구운 빵 냄새와 활기찬 직원들의 목소리, 그리고 쟁반 가득 빵을 담는 사람들의 열기에 압도당하게 됩니다. 시그니처인 '튀김소보로'는 겉은 바삭하고 속은 달콤한 팥으로 꽉 차 있어 한 입 베어 물면 '바사삭' 소리와 함께 행복이 밀려옵니다. 담백하고 부드러운 '판타롱 부추빵'과 짭조름한 감칠맛이 일품인 '명란 바게트'도 놓칠 수 없는 별미입니다.\n\n성심당의 매력은 빵 맛뿐만이 아닙니다. 구매한 빵을 바로 먹을 수 있는 2층 '테라스 키친'은 국내 최초의 베이커리 식당으로, 이곳에서 파는 추억의 경양식 돈가스와 오므라이스도 수준급입니다. 주말이면 가게 밖으로 긴 줄이 늘어서지만, 놀라울 정도로 체계적인 시스템 덕분에 생각보다 금방 입장할 수 있습니다. 대전에 왔다면 양손 가득 성심당 쇼핑백을 들고 돌아가는 것이 일종의 국룰! 부모님, 친구, 직장 동료 누구에게 선물해도 환영받는 최고의 기념품이 될 것입니다. 케이크를 좋아하신다면 근처에 있는 '성심당 케익부띠끄'도 꼭 들러보세요.",
    tags: ["맛집", "빵지순례", "문화유산", "튀김소보로", "기념품"],
    image:
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=800",
    district: "중구",
    views: 3200,
    rating: 4.9,
  },
  {
    id: "5",
    name: "대전 오월드",
    description:
      "동물원(쥬랜드), 꽃구경(플라워랜드), 놀이기구(조이랜드), 그리고 버드랜드까지! 오월드는 이 모든 것을 한곳에서 즐길 수 있는 중부권 최대 규모의 종합 테마파크입니다. 직접 가보니 아이들뿐만 아니라 어른들이 더 신나 할 만한 요소가 가득했습니다. 가장 인기 있는 '아프리카 사파리'에서는 버스를 타고 사자, 호랑이, 곰 등 맹수들을 코앞에서 생생하게 관찰할 수 있는데, 운전 기사님의 재치 있는 설명 덕분에 버스 안은 웃음바다가 됩니다. 늑대들이 무리지어 다니는 모습을 볼 수 있는 늑대 사파리도 이색적입니다.\n\n봄에는 튤립 축제, 여름에는 장미 축제 등 계절마다 바뀌는 플라워랜드는 인생샷 명소로 손색이 없습니다. 밤이 되면 화려한 조명과 홀로그램이 어우러진 '나이트 유니버스'가 개장하여 낮과는 또 다른 신비롭고 몽환적인 분위기를 자아냅니다. 마치 아바타의 숲속에 들어온 듯한 환상적인 조명 연출은 데이트 코스로 최고입니다. 하루 종일 놀아도 지루하지 않은 꿈과 환상의 나라, 오월드에서 동심으로 돌아가 잊지 못할 추억을 만들어보세요. 자유이용권이 아깝지 않은 알찬 하루를 보장합니다.",
    tags: ["테마파크", "가족여행", "동물원", "놀이공원", "사파리"],
    image:
      "https://images.unsplash.com/photo-1558522338-d9d37533605e?auto=format&fit=crop&q=80&w=800",
    district: "중구",
    views: 1500,
    rating: 4.4,
  },
  {
    id: "6",
    name: "보문산 숲치유센터",
    description:
      "복잡한 도심을 떠나 숲이 주는 위로를 받고 싶다면 보문산으로 오세요. 대전 시민들이 가장 즐겨 찾는 산 중 하나인 보문산 자락에 위치한 숲치유센터는 말 그대로 자연 속에서 몸과 마음을 '치유'할 수 있는 공간입니다. 숲 해설가와 함께하는 숲길 걷기, 명상, 편백나무 칩 밟기 등 다양한 체험 프로그램을 통해 숲이 주는 맑은 에너지를 온몸으로 느낄 수 있습니다. 등산로가 가파르지 않고 완만하게 잘 정비되어 있어, 등산화가 없어도 가벼운 운동화 차림으로 충분히 산림욕을 즐길 수 있다는 점이 가장 큰 매력입니다.\n\n산행 후에는 보문산 입구에 늘어선 식당가에서 보리밥과 도토리묵, 파전 등 푸짐하고 건강한 음식을 맛보는 즐거움도 빼놓을 수 없습니다. 특히 겉바속촉 파전에 시원한 막걸리 한 잔이면 세상 부러울 것이 없습니다. 근처의 보문산 전망대에 오르면 대전 야구장(한화생명이글스파크)을 포함한 원도심 풍경이 시원하게 펼쳐져 가슴 뻥 뚫리는 상쾌함을 선사합니다. 등산과 힐링, 그리고 미식까지 한 번에 해결할 수 있는 보문산 코스, 부모님과 함께하는 효도 여행지로도 강력 추천합니다.",
    tags: ["힐링", "등산", "자연", "숲체험", "트레킹"],
    image:
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=800",
    district: "중구",
    views: 600,
    rating: 4.3,
  },
  {
    id: "7",
    name: "한밭수목원",
    description:
      "회색빛 빌딩 숲 사이에 마법처럼 펼쳐진 초록빛 쉼터, 한밭수목원은 국내 최대 규모의 도심형 인공 수목원입니다. 엑스포 시민광장을 중심으로 동원과 서원, 그리고 열대식물원으로 나뉘어 있어 각기 다른 매력을 뽐냅니다. 동원은 장미원, 허브원 등 아기자기하고 화려한 꽃들이 가득해 사진 찍기에 좋고, 서원은 울창한 숲과 습지가 조성되어 있어 조용히 사색하며 산책하기에 그만입니다. 맹꽁이가 서식할 정도로 생태계가 잘 보존되어 있다는 점이 놀랍습니다.\n\n사계절 내내 푸르름을 자랑하는 열대식물원에서는 맹그로브 숲 등 이국적인 식물들을 만나볼 수 있어 비 오는 날 실내 데이트 코스로도 제격입니다. 넓게 펼쳐진 잔디 광장은 주말이면 돗자리를 펴고 피크닉을 즐기는 가족과 연인들로 활기가 넘칩니다. 자전거를 대여해서(타슈) 수목원 주변을 한 바퀴 도는 것도 추천합니다. 바로 옆에 대전예술의전당, 시립미술관, 이응노미술관 등 문화 예술 시설들이 모여 있어, 자연 속 힐링과 문화생활을 동시에 즐길 수 있는 대전 여행의 필수 코스이자 문화 1번지입니다.",
    tags: ["수목원", "피크닉", "자연", "도심속힐링", "산책"],
    image:
      "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&q=80&w=800",
    district: "서구",
    views: 2800,
    rating: 4.7,
  },
  {
    id: "8",
    name: "장태산 자연휴양림",
    description:
      "입구에 들어서는 순간 '와!' 하는 탄성이 절로 나옵니다. 하늘을 찌를 듯 꼿꼿하게 뻗은 메타세쿼이아 나무들이 빽빽하게 들어찬 숲, 장태산 자연휴양림은 보는 것만으로도 가슴이 웅장해지는 곳입니다. 문재인 전 대통령이 여름 휴가차 방문하여 독서를 즐긴 곳으로 더욱 유명해졌습니다. 이곳의 하이라이트는 단연 숲 사이 공중을 가로지르는 '숲속 어드벤처 스카이웨이'입니다. 흔들리는 다리 위를 걸으며 마치 나무 꼭대기 위를 산책하는 듯한 짜릿함과 함께 숲의 청량한 공기를 가장 가까이서 마실 수 있습니다.\n\n스카이타워 전망대 정상에 오르면 끝없이 펼쳐진 초록빛 숲의 파노라마가 눈앞에 펼쳐지는데, 그 풍경은 감동 그 자체입니다. 바람이 불 때마다 숲 전체가 '쏴아' 하고 파도치는 소리는 마음을 차분하게 정화해 줍니다. 캠핑장, 숙박시설, 산책로가 잘 갖춰져 있어 하루 묵어가며 여유롭게 삼림욕을 즐기기에도 좋습니다. 가을이면 온 숲이 붉은빛으로 물들어 이국적이고 낭만적인 분위기를 자아내는 단풍 명소이기도 합니다. 숲속 평상에 누워 나뭇잎 사이로 쏟아지는 햇살을 맞으며 낮잠을 청해보세요. 지상 낙원이 따로 없습니다.",
    tags: ["휴양림", "메타세쿼이아", "힐링", "스카이웨이", "인생샷"],
    image:
      "https://images.unsplash.com/photo-1623944893781-a9f987258411?auto=format&fit=crop&q=80&w=800",
    district: "서구",
    views: 2100,
    rating: 4.8,
  },
  {
    id: "9",
    name: "둔산동 타임월드",
    description:
      "대전의 최신 트렌드를 가장 먼저 만나볼 수 있는 곳, 둔산동 타임월드 거리는 '대전의 강남'이라 불리는 최대 번화가입니다. 갤러리아 타임월드 백화점을 중심으로 수많은 의류 브랜드, 화장품 매장, 편집샵들이 즐비해 쇼핑을 즐기기에 최적의 장소입니다. 골목마다 개성 넘치는 인테리어의 카페와 전국적으로 유명한 맛집, 분위기 좋은 다이닝 펍과 술집들이 밤늦게까지 불을 밝히며 젊음의 열기를 발산합니다. 주말 저녁이면 발 디딜 틈 없이 붐비는 인파 속에서 대전의 활기를 제대로 느낄 수 있습니다.\n\n대전의 2030 세대가 약속 장소로 가장 많이 잡는 곳이기도 하며, 거리 곳곳에서 버스킹 공연이 열리기도 해 걷는 재미가 있습니다. 교보문고와 같은 대형 서점과 영화관, 호텔, 병원 등 모든 편의 시설이 밀집해 있어 여행 중 필요한 모든 것을 해결할 수 있는 베이스캠프와도 같은 곳입니다. 맛집 탐방 후 분위기 좋은 칵테일 바에서 하루를 마무리하거나, 최신 유행하는 패션 아이템을 쇼핑하고 싶다면 고민 없이 둔산동으로 향하세요. 대전의 밤은 둔산동에서 시작됩니다.",
    tags: ["쇼핑", "도시", "맛집", "핫플레이스", "번화가"],
    image:
      "https://images.unsplash.com/photo-1533658299863-71887e076633?auto=format&fit=crop&q=80&w=800",
    district: "서구",
    views: 1850,
    rating: 4.2,
  },
  {
    id: "10",
    name: "엑스포 과학공원",
    description:
      "1993년 전 국민을 열광시켰던 대전 엑스포의 영광과 추억이 서린 곳이자, '과학 도시 대전'의 정체성을 상징하는 랜드마크입니다. 우주정거장을 연상시키는 독특한 디자인의 한빛탑에 오르면 갑천과 대전 도심의 탁 트인 전경을 한눈에 조망할 수 있습니다. 최근 리뉴얼을 통해 한빛탑 앞 광장은 시민들의 휴식처로 거듭났으며, 특히 여름밤 무더위를 식혀주는 음악분수 공연은 화려한 조명과 신나는 음악이 어우러져 최고의 볼거리를 선사합니다. 아이들은 물놀이에 신나고, 어른들은 돗자리를 펴고 치맥을 즐기는 평화로운 풍경이 펼쳐집니다.\n\n밤에는 한빛탑 외벽을 스크린으로 활용한 미디어파사드 공연이 펼쳐져 낭만적인 야경을 연출합니다. 바로 옆에는 '대전신세계 Art&Science' 백화점이 연결되어 있어, 쇼핑과 미식, 과학 체험과 휴식을 원스톱으로 즐길 수 있는 대전 최고의 복합 문화 공간으로 사랑받고 있습니다. 엑스포 다리를 건너며 바라보는 갑천의 야경 또한 놓칠 수 없는 포인트입니다. 과거의 영광과 미래의 희망이 공존하는 곳, 엑스포 과학공원에서 대전만의 특별한 밤을 즐겨보세요.",
    tags: ["야경", "과학", "분수쇼", "한빛탑", "미디어파사드"],
    image:
      "https://images.unsplash.com/photo-1565060169190-6218d96b4e3f?auto=format&fit=crop&q=80&w=800",
    district: "유성구",
    views: 3200,
    rating: 4.6,
  },
  {
    id: "11",
    name: "유성온천 족욕체험장",
    description:
      "여행으로 지친 다리의 피로를 말끔히 씻어낼 수 있는 도심 속 오아시스입니다. 조선 태조 이성계도 찾았다는 유서 깊은 유성온천의 물을 누구나 무료로 즐길 수 있도록 조성된 야외 족욕장입니다. 40도 전후의 뜨끈한 천연 온천수에 발을 담그고 있으면 온몸의 긴장이 풀리며 노곤한 행복감이 밀려옵니다. 20분 정도만 담그고 있어도 이마에 송골송골 땀이 맺히며 혈액순환이 되는 것을 느낄 수 있습니다. 한방 약초를 넣은 한방 족욕장 등 다양한 테마 탕이 있으며, 저녁 늦은 시간까지 운영되어 식사 후 산책 겸 들르기에 아주 좋습니다.\n\n머리 위로는 이팝나무가 그늘을 만들어주고, 발아래로는 따뜻한 온천수가 흐르는 이곳은 진정한 소확행을 느낄 수 있는 공간입니다. 동네 주민들의 사랑방 역할도 톡톡히 하고 있어 정겨운 분위기를 자아냅니다. 수건을 미처 챙기지 못했더라도 걱정 마세요. 젖은 발을 뽀송하게 말려주는 에어건 시설이 잘 갖춰져 있어 언제든 부담 없이 방문할 수 있습니다. 족욕 후 근처 유성시장에서 국밥 한 그릇 하거나 빵집을 들르는 코스도 추천합니다.",
    tags: ["온천", "휴식", "무료", "족욕", "피로회복"],
    image:
      "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=800",
    district: "유성구",
    views: 1100,
    rating: 4.5,
  },
  {
    id: "12",
    name: "국립중앙과학관",
    description:
      "우리나라 과학기술의 과거, 현재, 미래를 한눈에 볼 수 있는 국내 최대 규모의 과학관입니다. 단순히 눈으로만 보는 전시가 아니라 직접 만지고 체험하며 원리를 깨우치는 체험형 전시가 가득해 아이들은 물론 어른들도 시간 가는 줄 모르고 빠져들게 됩니다. 거대한 공룡 뼈가 전시된 자연사관, 우리 조상들의 지혜를 엿볼 수 있는 한국과학기술사관, 최첨단 로봇과 드론을 만날 수 있는 미래기술관 등 볼거리가 무궁무진합니다. 특히 돔형 스크린에서 우주를 여행하는 듯한 경험을 선사하는 천체관(플라네타륨)은 누워서 별자리를 감상하는 낭만적인 경험을 제공합니다.\n\n실제로 탑승해 볼 수 있는 자기부상열차 체험은 아이들에게 인기 만점이라 사전 예약이 필수입니다. 야외에는 거대한 나로호 모형과 공룡 모형이 있어 포토존으로도 훌륭합니다. '과학은 어렵다'는 편견을 깨고 호기심과 상상력을 자극하는 흥미진진한 모험의 공간입니다. 규모가 워낙 방대하여 꼼꼼히 보려면 반나절 이상 투자해야 할 정도입니다. 아이와 함께하는 대전 여행이라면 1순위로 방문해야 할 곳, 국립중앙과학관에서 과학의 매력에 푹 빠져보세요.",
    tags: ["교육", "아이와함께", "박물관", "과학체험", "실내여행"],
    image:
      "https://images.unsplash.com/photo-1518152006812-edab29b069ac?auto=format&fit=crop&q=80&w=800",
    district: "유성구",
    views: 1450,
    rating: 4.7,
  },
  {
    id: "13",
    name: "계족산 황토길",
    description:
      "한국관광 100선에 4회 연속 선정될 만큼 명성이 자자한, 대한민국을 대표하는 힐링 명소입니다. 계족산 숲길을 따라 약 14.5km에 걸쳐 조성된 부드러운 황토길은 신발과 양말을 벗어던지고 맨발로 걸어야 그 진가를 제대로 느낄 수 있습니다. 발가락 사이로 파고드는 찰진 황토의 시원한 감촉과 숲속에서 불어오는 상쾌한 바람은 일상에 지친 몸과 마음을 정화해 줍니다. 경사가 완만하여 아이부터 어르신까지 남녀노소 누구나 편안하게 걸을 수 있으며, 걷는 내내 피톤치드를 가득 마실 수 있는 건강 산책로입니다.\n\n주말에는 숲속 야외 공연장에서 클래식 공연인 '뻔뻔(fun fun)한 클래식'이 열려 숲과 음악이 어우러진 낭만을 선사합니다. 숲속에서 울려 퍼지는 오페라 아리아는 색다른 감동을 줍니다. 산책 후에는 발을 씻을 수 있는 세족장도 잘 마련되어 있어 개운한 기분으로 하산할 수 있습니다. 비 오는 날에는 황토의 질감이 더욱 찰져져서 색다른 재미를 느낄 수 있습니다. 자연과 하나 되는 특별한 경험, 계족산 황토길에서 느껴보세요.",
    tags: ["맨발걷기", "트레킹", "건강", "황토길", "자연치유"],
    image:
      "https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&q=80&w=800",
    district: "대덕구",
    views: 1900,
    rating: 4.8,
  },
  {
    id: "14",
    name: "대청댐 물문화관",
    description:
      "충청권의 젖줄인 대청호의 웅장한 풍광과 거대한 대청댐의 위용을 감상할 수 있는 최고의 포인트입니다. 물문화관에서는 물의 소중함과 댐의 원리에 대해 쉽고 재미있게 배울 수 있어 아이들의 교육 장소로도 훌륭합니다. 댐 정상 길을 따라 걸으면 탁 트인 호수의 전경이 가슴을 시원하게 뚫어주며, 해 질 녘에는 호수 위로 부서지는 윤슬이 황금빛 장관을 이룹니다. 운이 좋으면 댐 방류 장면을 볼 수도 있는데, 그 웅장한 물줄기와 소리는 압도적인 경험을 선사합니다.\n\n대청호 주변을 따라 이어지는 도로는 드라이브 코스로 유명한데, 봄에는 환상적인 벚꽃 터널이, 가을에는 은빛 억새 물결이 드라이버들을 유혹합니다. 댐 근처에는 호수를 조망할 수 있는 분위기 좋은 카페와 레스토랑들이 많아 데이트 코스로도 인기가 높습니다. 잔디밭에서 연을 날리거나 솜사탕을 먹으며 여유로운 시간을 보내는 가족들의 모습이 평화롭습니다. 자연과 인공 구조물이 조화를 이룬 아름다운 풍경 속에서 여유로운 휴식을 즐겨보세요.",
    tags: ["댐", "드라이브", "풍경", "대청호", "물문화관"],
    image:
      "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&q=80&w=800",
    district: "대덕구",
    views: 1300,
    rating: 4.5,
  },
  {
    id: "15",
    name: "동춘당 공원",
    description:
      "회색빛 아파트 숲속에 고즈넉이 자리 잡은 한옥 한 채, 바로 조선 효종 때 병조판서를 지낸 동춘당 송준길 선생의 고택입니다. 보물로 지정된 동춘당은 꾸밈없이 소박하면서도 기품 있는 한국 전통 건축의 미를 잘 보여주는 건축물입니다. '살아 움직이는 봄'이라는 뜻의 동춘당(同春堂)은 그 이름처럼 언제나 따뜻한 기운을 품고 있는 듯합니다. 넓은 마당과 오래된 나무들이 어우러진 공원은 도심 속에서 역사의 숨결을 느끼며 사색에 잠기기에 더할 나위 없이 좋은 장소입니다.\n\n봄에는 고택 담장을 따라 매화가 흐드러지게 피고, 가을에는 국화 전시회가 열려 그윽한 꽃향기로 가득 찹니다. 밤이 되면 은은한 조명이 켜져 더욱 운치 있는 분위기를 연출합니다. 고택 마루에 앉아 잠시 쉬어가거나, 흙담 길을 따라 천천히 산책하다 보면 바쁜 일상 속에서 잊고 지냈던 여유와 평온함을 되찾을 수 있습니다. 대덕구 주민들에게는 소중한 쉼터이자, 여행객들에게는 한국의 멋을 느낄 수 있는 특별한 공간입니다. 매년 열리는 동춘당 문화제 기간에 방문하면 다양한 전통 행사도 체험할 수 있습니다.",
    tags: ["역사", "산책", "문화재", "한옥", "고택"],
    image:
      "https://images.unsplash.com/photo-1597825006277-22f2b36f1c41?auto=format&fit=crop&q=80&w=800",
    district: "대덕구",
    views: 600,
    rating: 4.4,
  },
];

// --- Components ---

const VisitorStatsCard = ({ daily, total }) => (
  <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
    <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-4 text-white">
      <h3 className="font-bold text-lg flex items-center">
        <TrendingUp className="mr-2" size={20} />
        실시간 방문 현황
      </h3>
      <p className="text-emerald-100 text-xs mt-1">대전 여행을 함께하는 분들</p>
    </div>
    <div className="p-5 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
            <Calendar size={20} />
          </div>
          <span className="text-sm font-medium text-gray-600">오늘 방문자</span>
        </div>
        <span className="text-xl font-bold text-gray-900">
          {daily.toLocaleString()}
        </span>
      </div>

      <div className="h-px bg-gray-100 w-full"></div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
            <Users size={20} />
          </div>
          <span className="text-sm font-medium text-gray-600">누적 방문자</span>
        </div>
        <span className="text-xl font-bold text-gray-900">
          {total.toLocaleString()}
        </span>
      </div>
    </div>
    <div className="bg-gray-50 p-3 text-center border-t border-gray-100">
      <span className="text-xs text-gray-400">
        데이터는 실시간으로 집계됩니다
      </span>
    </div>
  </div>
);

const ChatWidget = ({ user }) => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Try to subscribe only if we can. If auth fails or config is bad, this might error.
    // We wrap in try-catch conceptually, but onSnapshot throws async.
    // Just be safe: if no user, don't try.
    if (!user || !db) return;

    let unsubscribe = () => {};

    try {
      const chatRef = collection(
        db,
        "artifacts",
        appId,
        "public",
        "data",
        "chat_messages"
      );
      const q = query(chatRef, orderBy("createdAt", "desc")); // Getting last messages

      unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const msgs = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          // Re-sort for display (oldest top)
          msgs.sort((a, b) => a.createdAt - b.createdAt);
          setMessages(msgs.slice(-50));
        },
        (error) => {
          // Silent fail or log for chat
          console.warn(
            "Chat sync error (likely permission/config):",
            error.message
          );
        }
      );
    } catch (e) {
      console.warn("Chat setup error:", e);
    }

    return () => unsubscribe();
  }, [user]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !user) return;

    const text = inputText;
    setInputText("");

    try {
      await addDoc(
        collection(db, "artifacts", appId, "public", "data", "chat_messages"),
        {
          text: text,
          createdAt: Date.now(),
          userId: user.uid,
          color: "#" + user.uid.slice(0, 6),
        }
      );
    } catch (err) {
      console.error("Failed to send message", err);
      alert("메시지 전송 실패 (Firebase 설정을 확인하세요)");
      setInputText(text);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden flex flex-col h-[400px]">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-3 text-white flex justify-between items-center">
        <h3 className="font-bold text-sm flex items-center">
          <MessageCircle size={16} className="mr-2" />
          실시간 여행 톡
        </h3>
        <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full">
          Live
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50">
        {!user ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 text-xs space-y-2">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p>서버 연결 중...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-xs text-gray-400 py-10">
            첫 메시지를 남겨보세요! 👋
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.userId === user?.uid;
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  isMe ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-lg px-3 py-2 text-xs shadow-sm ${
                    isMe
                      ? "bg-blue-500 text-white rounded-tr-none"
                      : "bg-white border border-gray-200 text-gray-800 rounded-tl-none"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <form
        onSubmit={handleSendMessage}
        className="p-2 bg-white border-t border-gray-100 flex gap-2"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={user ? "메시지 입력..." : "연결 중..."}
          disabled={!user}
          className="flex-1 text-xs border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-400"
        />
        <button
          type="submit"
          disabled={!inputText.trim() || !user}
          className="bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          <Send size={14} />
        </button>
      </form>
    </div>
  );
};

const PlaceCard = ({ place, onClick, isAdmin, onEdit, onDelete }) => (
  <div className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col h-full cursor-pointer relative">
    {isAdmin && (
      <div className="absolute top-3 left-3 z-20 flex space-x-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(place);
          }}
          className="p-1.5 bg-white/90 rounded-full text-blue-600 hover:bg-blue-100 shadow-sm"
          title="수정"
        >
          <Edit size={14} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(place.id);
          }}
          className="p-1.5 bg-white/90 rounded-full text-red-600 hover:bg-red-100 shadow-sm"
          title="삭제"
        >
          <Trash size={14} />
        </button>
      </div>
    )}

    <div
      className="relative h-48 overflow-hidden"
      onClick={() => onClick(place.id)}
    >
      <img
        src={place.image || "https://via.placeholder.com/800x400?text=No+Image"}
        alt={place.name}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        onError={(e) => {
          e.target.src = "https://via.placeholder.com/800x400?text=Image+Error";
        }}
      />
      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2 py-1 rounded-full text-xs font-bold text-emerald-600 shadow-sm flex items-center">
        <Star size={12} className="mr-1 fill-emerald-600" />
        추천
      </div>
      {place.district && (
        <div className="absolute bottom-3 left-3 bg-black/50 backdrop-blur px-2 py-1 rounded-md text-xs font-medium text-white shadow-sm">
          {place.district}
        </div>
      )}
    </div>
    <div className="p-5 flex-1 flex flex-col" onClick={() => onClick(place.id)}>
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-xl font-bold text-gray-800 group-hover:text-emerald-600 transition-colors">
          {place.name}
        </h3>
        <div className="flex items-center text-yellow-500 text-sm font-bold bg-yellow-50 px-1.5 py-0.5 rounded">
          <Star size={14} className="fill-yellow-500 mr-1" />
          {place.rating}
        </div>
      </div>

      <p className="text-gray-600 text-sm leading-relaxed mb-4 flex-1 line-clamp-2">
        {place.description}
      </p>

      <div className="flex items-center text-xs text-gray-400 mb-3 space-x-3">
        <span className="flex items-center">
          <Eye size={14} className="mr-1" />{" "}
          {place.views ? place.views.toLocaleString() : 0}
        </span>
        <span className="w-px h-3 bg-gray-200"></span>
        <span className="flex items-center">
          <ThumbsUp size={14} className="mr-1" />{" "}
          {Math.floor((place.views || 0) * 0.1).toLocaleString()}
        </span>
      </div>

      <div className="flex flex-wrap gap-2 mt-auto">
        {place.tags &&
          place.tags.map((tag, idx) => (
            <span
              key={idx}
              className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-md font-medium"
            >
              #{tag}
            </span>
          ))}
      </div>
    </div>
  </div>
);

// --- Full Page Place Detail ---
const PlaceDetailView = ({ place, onBack }) => {
  if (!place) return null;

  return (
    <div className="min-h-screen bg-white animate-fade-in">
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200 px-4 py-3 flex items-center">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-full text-gray-700 mr-2 transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <span className="text-lg font-bold text-gray-800">상세 정보</span>
      </nav>

      <div className="max-w-5xl mx-auto p-0 md:p-8">
        <div className="w-full h-72 md:h-[500px] overflow-hidden md:rounded-2xl relative bg-gray-100 shadow-lg mb-8">
          <img
            src={place.image}
            alt={place.name}
            className="w-full h-full object-cover"
            onError={(e) =>
              (e.target.src =
                "https://via.placeholder.com/800x400?text=No+Image")
            }
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6 md:p-8 text-white">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-1 bg-emerald-600 text-white text-xs font-bold rounded-md shadow-sm">
                {place.district}
              </span>
              <div className="flex items-center text-yellow-400 text-sm font-bold bg-black/30 px-2 py-0.5 rounded-md backdrop-blur-sm">
                <Star size={14} className="fill-yellow-400 mr-1" />
                {place.rating}
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2 drop-shadow-md">
              {place.name}
            </h1>
          </div>
        </div>

        <div className="px-6 md:px-8 pb-12">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
            <div className="flex items-center text-gray-500 text-sm">
              <Eye size={18} className="mr-1.5" />
              <span className="font-medium">
                {place.views ? place.views.toLocaleString() : 0}
              </span>
              명이 관심을 가졌어요
            </div>
            <div className="flex gap-2">{/* 공유하기 버튼 등 추가 가능 */}</div>
          </div>

          <div className="prose prose-lg max-w-none text-gray-700 mb-10 leading-relaxed whitespace-pre-line">
            {place.description}
          </div>

          <div className="bg-gray-50 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <Navigation size={20} className="mr-2 text-emerald-600" />
              관련 태그
            </h3>
            <div className="flex flex-wrap gap-2.5">
              {place.tags &&
                place.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="text-sm bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-full shadow-sm font-medium hover:text-emerald-600 hover:border-emerald-200 transition-colors cursor-default"
                  >
                    #{tag}
                  </span>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Login Modal ---
const LoginModal = ({ isOpen, onClose, onLogin }) => {
  const [password, setPassword] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(password);
    setPassword("");
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-xs shadow-2xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg text-gray-800">관리자 로그인</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <input
              type="password"
              placeholder="비밀번호 (1234)"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-emerald-600 text-white py-2 rounded-lg font-bold hover:bg-emerald-700 transition-colors"
          >
            로그인
          </button>
        </form>
      </div>
    </div>
  );
};

// --- Write/Edit Modal ---
const PlaceFormModal = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: "",
    district: "동구",
    tags: "",
    rating: 4.5,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        tags: (initialData.tags || []).join(", "),
      });
    } else {
      setFormData({
        name: "",
        description: "",
        image:
          "https://images.unsplash.com/photo-1596627622998-150992383188?auto=format&fit=crop&q=80&w=800",
        district: "동구",
        tags: "",
        rating: 4.5,
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      tags: formData.tags
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t),
      rating: Number(formData.rating),
    });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 className="font-bold text-lg text-gray-800">
            {initialData ? "여행지 수정" : "새 여행지 등록"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              여행지 이름
            </label>
            <input
              required
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              구 선택
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none"
              value={formData.district}
              onChange={(e) =>
                setFormData({ ...formData, district: e.target.value })
              }
            >
              {["동구", "중구", "서구", "유성구", "대덕구"].map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              설명
            </label>
            <textarea
              required
              rows={10}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              <ImageIcon size={14} className="mr-1" />
              이미지 URL (첨부)
            </label>
            <input
              type="url"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
              value={formData.image}
              onChange={(e) =>
                setFormData({ ...formData, image: e.target.value })
              }
              placeholder="https://... (이미지 주소를 입력하세요)"
            />
            {/* 이미지 미리보기 추가 */}
            {formData.image && (
              <div className="mt-2 relative rounded-lg overflow-hidden border border-gray-200 h-40 bg-gray-50">
                <img
                  src={formData.image}
                  alt="Preview"
                  className="w-full h-full object-contain"
                  onError={(e) =>
                    (e.target.src =
                      "https://via.placeholder.com/400x200?text=Invalid+Image+URL")
                  }
                />
                <div className="absolute bottom-0 right-0 bg-black/50 text-white text-xs px-2 py-1">
                  미리보기
                </div>
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              태그 (쉼표로 구분)
            </label>
            <input
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              value={formData.tags}
              onChange={(e) =>
                setFormData({ ...formData, tags: e.target.value })
              }
              placeholder="카페, 야경, 데이트"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              평점 (0.0 ~ 5.0)
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="5"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              value={formData.rating}
              onChange={(e) =>
                setFormData({ ...formData, rating: parseFloat(e.target.value) })
              }
            />
          </div>
          <button
            type="submit"
            className="w-full bg-emerald-600 text-white py-3 rounded-lg font-bold hover:bg-emerald-700 transition-colors mt-4"
          >
            {initialData ? "수정 완료" : "등록하기"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default function DaejeonTravelApp() {
  const [activeTab, setActiveTab] = useState("전체");
  const [sortBy, setSortBy] = useState("recommendation");
  const [visitorStats, setVisitorStats] = useState({ daily: 0, total: 0 });
  const [user, setUser] = useState(null);
  const [trendingPlaces, setTrendingPlaces] = useState([]);

  // Set initial state directly from hardcoded data so it's always visible
  const [places, setPlaces] = useState(initialDistrictsData);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlace, setEditingPlace] = useState(null);
  const [headerImage, setHeaderImage] = useState(
    "https://images.unsplash.com/photo-1627960682701-7b001a140228?auto=format&fit=crop&q=80&w=1600"
  );

  // New State for Full Page View
  const [selectedPlace, setSelectedPlace] = useState(null);

  // Login Modal State
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // 1. Auth & Initial Setup
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (
          typeof __initial_auth_token !== "undefined" &&
          __initial_auth_token
        ) {
          // Note: signInWithCustomToken must be imported if used. Since we use simple import:
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (e) {
        console.error("Auth failed", e);
        // Fallback: do nothing, app runs in read-only mode
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  // Fetch Header Image from Config
  useEffect(() => {
    if (!user) return;
    try {
      const configRef = doc(
        db,
        "artifacts",
        appId,
        "public",
        "data",
        "config",
        "global"
      );
      const unsubscribe = onSnapshot(configRef, (snapshot) => {
        if (snapshot.exists() && snapshot.data().headerImage) {
          setHeaderImage(snapshot.data().headerImage);
        }
      });
      return () => unsubscribe();
    } catch (e) {
      console.warn("Config fetch failed", e);
    }
  }, [user]);

  const handleUpdateHeaderImage = async () => {
    if (!isAdmin) return;
    const newUrl = prompt("새로운 배경 이미지 URL을 입력하세요:", headerImage);
    if (newUrl && newUrl !== headerImage) {
      try {
        await setDoc(
          doc(db, "artifacts", appId, "public", "data", "config", "global"),
          {
            headerImage: newUrl,
          },
          { merge: true }
        );
      } catch (e) {
        alert("이미지 변경 실패 (Firebase 설정을 확인하세요)");
      }
    }
  };

  // 2. Fetch Places from Firestore
  useEffect(() => {
    if (!user) return;

    try {
      const q = collection(db, "artifacts", appId, "public", "data", "places");
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          if (!snapshot.empty) {
            const loadedPlaces = [];
            snapshot.forEach((doc) => {
              loadedPlaces.push({ id: doc.id, ...doc.data() });
            });
            setPlaces(loadedPlaces);
          }
          // If empty or error, we keep initialDistrictsData (Fallback)
        },
        (error) => {
          console.warn("Firestore fetch failed (using local data):", error);
        }
      );
      return () => unsubscribe();
    } catch (e) {
      console.warn("Firestore init failed", e);
    }
  }, [user]);

  // Login Handler
  const handleLoginAttempt = (password) => {
    if (password === "1234") {
      setIsAdmin(true);
      setIsLoginModalOpen(false);
    } else {
      alert("비밀번호가 틀렸습니다.");
    }
  };

  const handleAdminToggle = () => {
    if (isAdmin) {
      setIsAdmin(false);
    } else {
      setIsLoginModalOpen(true);
    }
  };

  // CRUD Operations
  const handleAddPlace = async (data) => {
    try {
      await addDoc(
        collection(db, "artifacts", appId, "public", "data", "places"),
        {
          ...data,
          views: 0,
        }
      );
      setIsModalOpen(false);
    } catch (e) {
      console.error(e);
      alert("등록 실패 (Firebase 설정을 확인하세요)");
    }
  };

  const handleUpdatePlace = async (data) => {
    if (!editingPlace) return;
    try {
      await setDoc(
        doc(
          db,
          "artifacts",
          appId,
          "public",
          "data",
          "places",
          editingPlace.id
        ),
        data,
        { merge: true }
      );
      setIsModalOpen(false);
      setEditingPlace(null);
    } catch (e) {
      console.error(e);
      alert("수정 실패 (Firebase 설정을 확인하세요)");
    }
  };

  const handleDeletePlace = async (id) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    try {
      await deleteDoc(
        doc(db, "artifacts", appId, "public", "data", "places", id)
      );
      // Optimistic update for immediate feedback if using local data fallback
      setPlaces((prev) => prev.filter((p) => p.id !== id));
    } catch (e) {
      console.error(e);
      alert("삭제 실패 (Firebase 설정을 확인하세요)");
    }
  };

  // 3. Visitor Stats
  useEffect(() => {
    if (!user) return;
    try {
      const statsRef = doc(
        db,
        "artifacts",
        appId,
        "public",
        "data",
        "visitor_stats_v2",
        "counts"
      );
      const todayStr = getTodayDateString();

      const incrementVisit = async () => {
        const sessionKey = `visited_${todayStr}`;
        const hasVisited = sessionStorage.getItem(sessionKey);

        if (!hasVisited) {
          try {
            await setDoc(
              statsRef,
              {
                total: increment(1),
                [`daily_${todayStr}`]: increment(1),
              },
              { merge: true }
            );
            sessionStorage.setItem(sessionKey, "true");
          } catch (e) {
            console.warn("Visitor count update failed (ReadOnly mode)", e);
          }
        }
      };
      incrementVisit();

      const unsubscribeSnapshot = onSnapshot(
        statsRef,
        (doc) => {
          if (doc.exists()) {
            const data = doc.data();
            setVisitorStats({
              daily: data[`daily_${todayStr}`] || 0,
              total: data.total || 0,
            });
          }
        },
        (error) => {
          console.warn("Stats fetch failed", error);
        }
      );
      return () => unsubscribeSnapshot();
    } catch (e) {
      console.warn("Stats init failed", e);
    }
  }, [user]);

  // 4. Trending Logic
  useEffect(() => {
    if (!user) return;
    try {
      const currentHourKey = getHourKey(0);
      const prevHourKey = getHourKey(-1);
      const trendingRef = doc(
        db,
        "artifacts",
        appId,
        "public",
        "data",
        "trending",
        currentHourKey
      );
      const prevTrendingRef = doc(
        db,
        "artifacts",
        appId,
        "public",
        "data",
        "trending",
        prevHourKey
      );

      let prevData = {};
      getDoc(prevTrendingRef)
        .then((snap) => {
          if (snap.exists()) prevData = snap.data();
        })
        .catch((e) => console.warn("Trending fetch failed", e));

      const unsubscribe = onSnapshot(
        trendingRef,
        (snap) => {
          const currentData = snap.exists() ? snap.data() : {};
          const sorted = Object.entries(currentData)
            .map(([id, count]) => ({
              id,
              count: count,
              prevCount: prevData[id] || 0,
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 3);

          const processed = sorted.map((item) => {
            const found = places.find((p) => p.id === item.id);
            return {
              name: found ? found.name : "알 수 없는 장소",
              diff: item.count - item.prevCount,
              current: item.count,
            };
          });
          setTrendingPlaces(processed);
        },
        (error) => {
          console.warn("Trending snapshot failed", error);
        }
      );
      return () => unsubscribe();
    } catch (e) {
      console.warn("Trending init failed", e);
    }
  }, [user, places]);

  const handlePlaceClick = async (id) => {
    // 1. Go to Detail Page (Full Screen)
    const place = places.find((p) => p.id === id);
    if (place) setSelectedPlace(place);

    // 2. Increment stats (Silent fail if read-only)
    if (!user) return;
    const hourKey = getHourKey(0);
    const trendingRef = doc(
      db,
      "artifacts",
      appId,
      "public",
      "data",
      "trending",
      hourKey
    );
    try {
      await setDoc(trendingRef, { [id]: increment(1) }, { merge: true });
    } catch (e) {
      console.warn("Trending update failed", e);
    }
  };

  // Categories
  const dynamicDistricts = useMemo(() => {
    return ["전체", "동구", "중구", "서구", "유성구", "대덕구"];
  }, [places]);

  const displayedPlaces = useMemo(() => {
    let filtered =
      activeTab === "전체"
        ? places
        : places.filter((p) => p.district === activeTab);
    return filtered.sort((a, b) => {
      if (sortBy === "views") return b.views - a.views;
      if (sortBy === "rating") return b.rating - a.rating;
      return 0;
    });
  }, [places, activeTab, sortBy]);

  // Main Render Logic: If selectedPlace is set, show Detail Page ONLY.
  if (selectedPlace) {
    return (
      <PlaceDetailView
        place={selectedPlace}
        onBack={() => setSelectedPlace(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => setActiveTab("전체")}
            >
              <div className="bg-emerald-600 text-white p-1.5 rounded-lg">
                <MapPin size={20} />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-500">
                대전여행 가이드
              </span>
            </div>

            <button
              onClick={handleAdminToggle}
              className={`flex items-center text-sm font-medium px-3 py-1.5 rounded-full transition-colors ${
                isAdmin
                  ? "bg-red-50 text-red-600 hover:bg-red-100"
                  : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              {isAdmin ? (
                <>
                  <LogOut size={16} className="mr-1.5" /> 관리자 종료
                </>
              ) : (
                <>
                  <LogIn size={16} className="mr-1.5" /> 관리자 로그인
                </>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative bg-emerald-900 overflow-hidden group">
        <div className="absolute inset-0 opacity-40 transition-opacity duration-700">
          <img
            src={headerImage}
            alt="Daejeon Background"
            className="w-full h-full object-cover transition-all duration-1000"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-900 via-transparent to-transparent"></div>

        {/* Admin Edit Header Button */}
        {isAdmin && (
          <button
            onClick={handleUpdateHeaderImage}
            className="absolute top-4 right-4 z-20 bg-black/50 hover:bg-black/70 text-white px-3 py-1.5 rounded-full text-xs flex items-center backdrop-blur-sm transition-all"
          >
            <Camera size={14} className="mr-1.5" /> 배경 수정
          </button>
        )}

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 text-center">
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white mb-4 tracking-tight">
            과학과 자연이 어우러진 도시, <br className="hidden sm:block" />
            <span className="text-emerald-300">대전으로 오세요!</span>
          </h1>
          <p className="text-emerald-100 text-lg sm:text-xl max-w-2xl mx-auto font-light mb-8">
            동구의 낭만부터 유성의 힐링까지, 대전 5개 구의 다채로운 매력을
            소개합니다.
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          {/* Left Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <VisitorStatsCard
              daily={visitorStats.daily}
              total={visitorStats.total}
            />

            <div className="bg-blue-50 rounded-xl p-5 border border-blue-100 hidden lg:block">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-bold text-blue-900 text-sm">
                  🔥 실시간 인기 급상승
                </h4>
              </div>
              <div className="space-y-3">
                {trendingPlaces.length > 0 ? (
                  trendingPlaces.map((place, index) => (
                    <div
                      key={index}
                      className="flex justify-between text-xs items-center"
                    >
                      <span className="text-gray-700 font-medium truncate w-24">
                        {index + 1}. {place.name}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400">
                          {place.current} view
                        </span>
                        {place.diff > 0 ? (
                          <span className="font-bold text-red-500 text-[10px]">
                            ▲ {place.diff}
                          </span>
                        ) : place.diff < 0 ? (
                          <span className="font-bold text-blue-500 text-[10px]">
                            ▼ {Math.abs(place.diff)}
                          </span>
                        ) : (
                          <span className="font-bold text-gray-400 text-[10px]">
                            -
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-xs text-gray-500 py-4">
                    아직 집계된 데이터가 없습니다.
                    <br />
                    여행지를 클릭해보세요!
                  </div>
                )}
              </div>
            </div>

            <div className="hidden lg:block">
              <ChatWidget user={user} />
            </div>
          </div>

          {/* Right Content */}
          <div className="lg:col-span-3">
            {/* Category Navigation */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <Navigation size={24} className="mr-2 text-emerald-600" />
                어디로 떠나볼까요?
              </h2>
              <div className="flex flex-wrap gap-2">
                {dynamicDistricts.map((category) => (
                  <button
                    key={category}
                    onClick={() => setActiveTab(category)}
                    className={`px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-200 border ${
                      activeTab === category
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-md ring-2 ring-emerald-100"
                        : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
              <p className="text-gray-500 text-sm w-full sm:w-auto text-center sm:text-left">
                총{" "}
                <span className="font-bold text-emerald-600">
                  {displayedPlaces.length}
                </span>
                개의 여행지가 기다리고 있습니다.
              </p>

              <div className="flex bg-white rounded-lg p-1 border border-gray-200 shadow-sm w-full sm:w-auto">
                <button
                  onClick={() => setSortBy("recommendation")}
                  className={`flex-1 sm:flex-none px-4 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    sortBy === "recommendation"
                      ? "bg-emerald-50 text-emerald-700"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  추천순
                </button>
                <button
                  onClick={() => setSortBy("views")}
                  className={`flex-1 sm:flex-none px-4 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    sortBy === "views"
                      ? "bg-emerald-50 text-emerald-700"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  인기순
                </button>
                <button
                  onClick={() => setSortBy("rating")}
                  className={`flex-1 sm:flex-none px-4 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    sortBy === "rating"
                      ? "bg-emerald-50 text-emerald-700"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  평점순
                </button>
              </div>
            </div>

            {/* Card Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedPlaces.map((place) => (
                <PlaceCard
                  key={place.id}
                  place={place}
                  onClick={(id) => handlePlaceClick(id)}
                  isAdmin={isAdmin}
                  onEdit={(p) => {
                    setEditingPlace(p);
                    setIsModalOpen(true);
                  }}
                  onDelete={handleDeletePlace}
                />
              ))}
              {/* Add New Place Card (Admin Only) */}
              {isAdmin && (
                <button
                  onClick={() => {
                    setEditingPlace(null);
                    setIsModalOpen(true);
                  }}
                  className="group border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center text-gray-400 hover:border-emerald-500 hover:text-emerald-500 hover:bg-emerald-50 transition-all h-[360px]"
                >
                  <div className="p-4 bg-gray-100 rounded-full group-hover:bg-emerald-100 mb-4 transition-colors">
                    <Plus size={32} />
                  </div>
                  <span className="font-bold">새 여행지 등록</span>
                </button>
              )}
            </div>

            {/* Travel Tips */}
            <div className="mt-12 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-6 items-start">
              <div className="p-3 bg-emerald-100 rounded-full text-emerald-600 shrink-0">
                <Info size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  알아두면 좋은 대전 여행 팁
                </h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <span className="w-1 h-1 bg-emerald-400 rounded-full mr-2"></span>
                    대전의 공영 자전거 '타슈'는 1시간 무료로 이용 가능합니다.
                    앱을 미리 설치하세요!
                  </li>
                  <li className="flex items-center">
                    <span className="w-1 h-1 bg-emerald-400 rounded-full mr-2"></span>
                    성심당 방문 시 '테이블링' 앱으로 대기 현황을 확인하면
                    편리합니다.
                  </li>
                  <li className="flex items-center">
                    <span className="w-1 h-1 bg-emerald-400 rounded-full mr-2"></span>
                    매달 축제가 열리는 엑스포 시민광장 일정을 미리 체크해보세요.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center items-center gap-2 mb-4">
            <MapPin size={24} className="text-emerald-500" />
            <span className="text-xl font-bold text-white">
              대전여행 가이드
            </span>
          </div>
          <p className="text-sm mb-6">대전의 아름다움, 당신의 일상이 됩니다.</p>
          <div className="flex justify-center gap-4 text-xs">
            <span className="px-2 py-1 bg-gray-800 rounded">React</span>
            <span className="px-2 py-1 bg-gray-800 rounded">Firebase</span>
            <span className="px-2 py-1 bg-gray-800 rounded">Tailwind</span>
          </div>
          <div className="mt-8 text-xs text-gray-600">
            &copy; {new Date().getFullYear()} Daejeon Travel Guide. All rights
            reserved.
          </div>
        </div>
      </footer>

      {/* Modals */}
      <PlaceFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={editingPlace ? handleUpdatePlace : handleAddPlace}
        initialData={editingPlace}
      />

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLogin={handleLoginAttempt}
      />
    </div>
  );
}
