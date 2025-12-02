<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>대전여행 가이드</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/lucide@latest"></script>
    <style>
        /* 부드러운 화면 전환 효과 */
        .fade-in { animation: fadeIn 0.5s ease-in-out; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .hidden { display: none !important; }
    </style>
</head>
<body class="bg-gray-50 font-sans text-gray-900">

    <nav class="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between h-16 items-center">
                <div class="flex items-center gap-2 cursor-pointer" onclick="window.location.reload()">
                    <div class="bg-emerald-600 text-white p-1.5 rounded-lg">
                        <i data-lucide="map-pin"></i>
                    </div>
                    <span class="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-500">
                        대전여행 가이드
                    </span>
                </div>
                <button onclick="alert('관리자 기능은 추후 업데이트 예정입니다!')" class="flex items-center text-sm font-medium px-3 py-1.5 rounded-full text-gray-500 hover:bg-gray-100 transition-colors">
                    <i data-lucide="log-in" class="w-4 h-4 mr-1.5"></i> 관리자 로그인
                </button>
            </div>
        </div>
    </nav>

    <div class="relative bg-emerald-900 overflow-hidden group">
        <div class="absolute inset-0 opacity-40">
            <img src="https://images.unsplash.com/photo-1627960682701-7b001a140228?auto=format&fit=crop&q=80&w=1600" alt="Daejeon" class="w-full h-full object-cover">
        </div>
        <div class="absolute inset-0 bg-gradient-to-t from-emerald-900 via-transparent to-transparent"></div>
        <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 text-center">
            <h1 class="text-3xl sm:text-5xl font-extrabold text-white mb-4 tracking-tight">
                과학과 자연이 어우러진 도시, <br class="hidden sm:block" />
                <span class="text-emerald-300">대전으로 오세요!</span>
            </h1>
            <p class="text-emerald-100 text-lg sm:text-xl max-w-2xl mx-auto font-light mb-8">
                동구의 낭만부터 유성의 힐링까지, 대전 5개 구의 다채로운 매력을 소개합니다.
            </p>
        </div>
    </div>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        <div class="mb-8">
            <h2 class="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <i data-lucide="navigation" class="mr-2 text-emerald-600"></i> 어디로 떠나볼까요?
            </h2>
            <div class="flex flex-wrap gap-2" id="category-container">
                </div>
        </div>

        <div class="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
            <p class="text-gray-500 text-sm">
                총 <span class="font-bold text-emerald-600" id="place-count">0</span>개의 여행지가 기다리고 있습니다.
            </p>
            <div class="flex bg-white rounded-lg p-1 border border-gray-200 shadow-sm">
                <button onclick="sortPlaces('recommendation')" class="px-4 py-1.5 text-xs font-medium rounded-md hover:bg-gray-50 transition-colors">추천순</button>
                <button onclick="sortPlaces('views')" class="px-4 py-1.5 text-xs font-medium rounded-md hover:bg-gray-50 transition-colors">인기순</button>
                <button onclick="sortPlaces('rating')" class="px-4 py-1.5 text-xs font-medium rounded-md hover:bg-gray-50 transition-colors">평점순</button>
            </div>
        </div>

        <div id="places-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 fade-in">
            </div>

    </main>

    <footer class="bg-gray-900 text-gray-400 py-12 border-t border-gray-800 mt-12">
        <div class="max-w-7xl mx-auto px-4 text-center">
            <div class="flex justify-center items-center gap-2 mb-4">
                <i data-lucide="map-pin" class="text-emerald-500"></i>
                <span class="text-xl font-bold text-white">대전여행 가이드</span>
            </div>
            <p class="text-sm mb-6">대전의 아름다움, 당신의 일상이 됩니다.</p>
            <div class="text-xs text-gray-600">&copy; 2025 Daejeon Travel Guide. All rights reserved.</div>
        </div>
    </footer>

    <div id="detail-modal" class="fixed inset-0 z-[100] hidden bg-white overflow-y-auto">
        <div class="max-w-5xl mx-auto min-h-screen bg-white relative">
            <button onclick="closeModal()" class="fixed top-4 right-4 z-50 bg-black/50 text-white p-2 rounded-full hover:bg-black/70">
                <i data-lucide="x"></i>
            </button>
            
            <div id="modal-content"></div>
        </div>
    </div>

    <script>
        // === 1. 데이터 (수정하신 내용 그대로 가져왔습니다) ===
        const placesData = [
          { id: "1", name: "소제동 카페거리", description: "대전역 동광장을 빠져나와 횡단보도 하나만 건너면 거짓말처럼 시간이 멈춘 마을이 나타납니다. 낡은 기와지붕 위로 나른하게 하품하는 고양이가 보이고, 좁은 골목 사이로 향긋한 커피 볶는 냄새가 바람을 타고 흘러옵니다.\n\n특히 비가 오는 날 처마 끝에서 떨어지는 빗소리를 들으며 마시는 차 한 잔은 그야말로 낭만 그 자체였습니다. SNS에서 핫한 '온천집'의 하얀 모래 정원은 마치 교토의 어느 료칸에 와 있는 듯한 착각을 불러일으키고, 대나무 숲이 우거진 '풍뉴가'에서는 바람에 흔들리는 대나무 소리가 ASMR처럼 들려옵니다.", tags: ["카페", "사진명소", "데이트", "뉴트로", "뚜벅이추천"], image: "https://images.unsplash.com/photo-1596627622998-150992383188?auto=format&fit=crop&q=80&w=800", district: "동구", views: 1205, rating: 4.5 },
          { id: "2", name: "식장산 전망대", description: "대전의 야경을 논할 때 절대 빼놓을 수 없는 곳, 바로 식장산입니다. 꼬불꼬불한 산길을 차로 15분 정도 오르다 보면 어느새 해발 598m 정상 부근에 도착합니다.\n\n전망대에 세워진 전통 누각 '식장루'에 오르면 더욱 운치 있는 풍경을 즐길 수 있습니다. 이곳에서 바라보는 대전 시내는 평평한 평지 위에 반듯하게 구획된 도시의 불빛들이 기하학적인 아름다움을 뽐냅니다.", tags: ["야경", "드라이브", "전망대", "일몰", "데이트코스"], image: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&q=80&w=800", district: "동구", views: 980, rating: 4.8 },
          { id: "3", name: "대동 하늘공원", description: "가파른 언덕길을 따라 오밀조밀 모여 있는 달동네가 알록달록한 벽화마을로 변신했습니다. 이곳의 랜드마크인 빨간 풍차 앞에서 내려다보는 풍경은 화려한 빌딩 숲의 야경과는 다른, 사람 냄새 나는 따뜻한 감동을 줍니다.", tags: ["일몰", "산책", "벽화마을", "풍차", "사진찍기좋은곳"], image: "https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?auto=format&fit=crop&q=80&w=800", district: "동구", views: 845, rating: 4.6 },
          { id: "4", name: "성심당 본점", description: "대전은 몰라도 성심당은 안다는 말이 있을 정도로, 성심당은 이제 단순한 빵집을 넘어 대전의 상징이자 자부심이 되었습니다. 은행동 본점에 들어서는 순간, 갓 구운 빵 냄새와 활기찬 직원들의 목소리에 압도당하게 됩니다.", tags: ["맛집", "빵지순례", "문화유산", "튀김소보로", "기념품"], image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=800", district: "중구", views: 3200, rating: 4.9 },
          { id: "5", name: "대전 오월드", description: "동물원, 꽃구경, 놀이기구, 그리고 버드랜드까지! 오월드는 이 모든 것을 한곳에서 즐길 수 있는 중부권 최대 규모의 종합 테마파크입니다. 아이들뿐만 아니라 어른들이 더 신나 할 만한 요소가 가득했습니다.", tags: ["테마파크", "가족여행", "동물원", "놀이공원", "사파리"], image: "https://images.unsplash.com/photo-1558522338-d9d37533605e?auto=format&fit=crop&q=80&w=800", district: "중구", views: 1500, rating: 4.4 },
          { id: "6", name: "보문산 숲치유센터", description: "복잡한 도심을 떠나 숲이 주는 위로를 받고 싶다면 보문산으로 오세요. 숲 해설가와 함께하는 숲길 걷기, 명상 등 다양한 체험 프로그램을 통해 숲이 주는 맑은 에너지를 온몸으로 느낄 수 있습니다.", tags: ["힐링", "등산", "자연", "숲체험", "트레킹"], image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=800", district: "중구", views: 600, rating: 4.3 },
          { id: "7", name: "한밭수목원", description: "회색빛 빌딩 숲 사이에 마법처럼 펼쳐진 초록빛 쉼터, 한밭수목원은 국내 최대 규모의 도심형 인공 수목원입니다. 엑스포 시민광장을 중심으로 동원과 서원, 그리고 열대식물원으로 나뉘어 있어 각기 다른 매력을 뽐냅니다.", tags: ["수목원", "피크닉", "자연", "도심속힐링", "산책"], image: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&q=80&w=800", district: "서구", views: 2800, rating: 4.7 },
          { id: "8", name: "장태산 자연휴양림", description: "하늘을 찌를 듯 꼿꼿하게 뻗은 메타세쿼이아 나무들이 빽빽하게 들어찬 숲, 장태산 자연휴양림은 보는 것만으로도 가슴이 웅장해지는 곳입니다. 문재인 전 대통령이 여름 휴가차 방문하여 독서를 즐긴 곳으로 더욱 유명해졌습니다.", tags: ["휴양림", "메타세쿼이아", "힐링", "스카이웨이", "인생샷"], image: "https://images.unsplash.com/photo-1623944893781-a9f987258411?auto=format&fit=crop&q=80&w=800", district: "서구", views: 2100, rating: 4.8 },
          { id: "9", name: "둔산동 타임월드", description: "대전의 최신 트렌드를 가장 먼저 만나볼 수 있는 곳, 둔산동 타임월드 거리는 '대전의 강남'이라 불리는 최대 번화가입니다. 갤러리아 타임월드 백화점을 중심으로 수많은 맛집과 카페가 즐비합니다.", tags: ["쇼핑", "도시", "맛집", "핫플레이스", "번화가"], image: "https://images.unsplash.com/photo-1533658299863-71887e076633?auto=format&fit=crop&q=80&w=800", district: "서구", views: 1850, rating: 4.2 },
          { id: "10", name: "엑스포 과학공원", description: "1993년 전 국민을 열광시켰던 대전 엑스포의 영광과 추억이 서린 곳입니다. 우주정거장을 연상시키는 한빛탑에 오르면 대전 도심의 탁 트인 전경을 한눈에 조망할 수 있습니다.", tags: ["야경", "과학", "분수쇼", "한빛탑", "미디어파사드"], image: "https://images.unsplash.com/photo-1565060169190-6218d96b4e3f?auto=format&fit=crop&q=80&w=800", district: "유성구", views: 3200, rating: 4.6 },
          { id: "11", name: "유성온천 족욕체험장", description: "여행으로 지친 다리의 피로를 말끔히 씻어낼 수 있는 도심 속 오아시스입니다. 40도 전후의 뜨끈한 천연 온천수에 발을 담그고 있으면 온몸의 긴장이 풀리며 노곤한 행복감이 밀려옵니다.", tags: ["온천", "휴식", "무료", "족욕", "피로회복"], image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=800", district: "유성구", views: 1100, rating: 4.5 },
          { id: "12", name: "국립중앙과학관", description: "우리나라 과학기술의 과거, 현재, 미래를 한눈에 볼 수 있는 국내 최대 규모의 과학관입니다. 아이들은 물론 어른들도 시간 가는 줄 모르고 빠져들게 됩니다.", tags: ["교육", "아이와함께", "박물관", "과학체험", "실내여행"], image: "https://images.unsplash.com/photo-1518152006812-edab29b069ac?auto=format&fit=crop&q=80&w=800", district: "유성구", views: 1450, rating: 4.7 },
          { id: "13", name: "계족산 황토길", description: "한국관광 100선에 선정된 힐링 명소입니다. 숲길을 따라 조성된 부드러운 황토길은 신발을 벗어던지고 맨발로 걸어야 그 진가를 제대로 느낄 수 있습니다.", tags: ["맨발걷기", "트레킹", "건강", "황토길", "자연치유"], image: "https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&q=80&w=800", district: "대덕구", views: 1900, rating: 4.8 },
          { id: "14", name: "대청댐 물문화관", description: "충청권의 젖줄인 대청호의 웅장한 풍광을 감상할 수 있는 최고의 포인트입니다. 댐 정상 길을 따라 걸으면 탁 트인 호수의 전경이 가슴을 시원하게 뚫어줍니다.", tags: ["댐", "드라이브", "풍경", "대청호", "물문화관"], image: "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&q=80&w=800", district: "대덕구", views: 1300, rating: 4.5 },
          { id: "15", name: "동춘당 공원", description: "도심 속에 고즈넉이 자리 잡은 한옥 한 채, 송준길 선생의 고택입니다. 꾸밈없이 소박하면서도 기품 있는 한국 전통 건축의 미를 잘 보여줍니다.", tags: ["역사", "산책", "문화재", "한옥", "고택"], image: "https://images.unsplash.com/photo-1597825006277-22f2b36f1c41?auto=format&fit=crop&q=80&w=800", district: "대덕구", views: 600, rating: 4.4 }
        ];

        // === 2. 상태 관리 ===
        let activeTab = "전체";
        let currentPlaces = [...placesData];

        // === 3. 화면 그리기 (렌더링) ===
        function renderCategories() {
            const districts = ["전체", "동구", "중구", "서구", "유성구", "대덕구"];
            const container = document.getElementById("category-container");
            container.innerHTML = "";

            districts.forEach(d => {
                const btn = document.createElement("button");
                const isActive = activeTab === d;
                btn.className = `px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-200 border ${isActive ? 'bg-emerald-600 text-white border-emerald-600 shadow-md' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`;
                btn.textContent = d;
                btn.onclick = () => { activeTab = d; filterPlaces(); };
                container.appendChild(btn);
            });
        }

        function renderPlaces() {
            const grid = document.getElementById("places-grid");
            const countSpan = document.getElementById("place-count");
            
            grid.innerHTML = "";
            countSpan.textContent = currentPlaces.length;

            currentPlaces.forEach(place => {
                const card = document.createElement("div");
                card.className = "group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col h-full cursor-pointer";
                card.onclick = () => openModal(place);

                // 태그 HTML 생성
                const tagsHtml = place.tags.map(tag => `<span class="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-md font-medium">#${tag}</span>`).join("");

                card.innerHTML = `
                    <div class="relative h-48 overflow-hidden">
                        <img src="${place.image}" alt="${place.name}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110">
                        <div class="absolute top-3 right-3 bg-white/90 backdrop-blur px-2 py-1 rounded-full text-xs font-bold text-emerald-600 shadow-sm flex items-center">
                            <i data-lucide="star" class="w-3 h-3 mr-1 fill-emerald-600"></i> 추천
                        </div>
                        <div class="absolute bottom-3 left-3 bg-black/50 backdrop-blur px-2 py-1 rounded-md text-xs font-medium text-white shadow-sm">
                            ${place.district}
                        </div>
                    </div>
                    <div class="p-5 flex-1 flex flex-col">
                        <div class="flex justify-between items-start mb-2">
                            <h3 class="text-xl font-bold text-gray-800 group-hover:text-emerald-600 transition-colors">${place.name}</h3>
                            <div class="flex items-center text-yellow-500 text-sm font-bold bg-yellow-50 px-1.5 py-0.5 rounded">
                                <i data-lucide="star" class="w-3 h-3 fill-yellow-500 mr-1"></i> ${place.rating}
                            </div>
                        </div>
                        <p class="text-gray-600 text-sm leading-relaxed mb-4 flex-1 line-clamp-2">${place.description}</p>
                        <div class="flex items-center text-xs text-gray-400 mb-3 space-x-3">
                            <span class="flex items-center"><i data-lucide="eye" class="w-3 h-3 mr-1"></i> ${place.views.toLocaleString()}</span>
                            <span class="flex items-center"><i data-lucide="thumbs-up" class="w-3 h-3 mr-1"></i> ${Math.floor(place.views * 0.1).toLocaleString()}</span>
                        </div>
                        <div class="flex flex-wrap gap-2 mt-auto">${tagsHtml}</div>
                    </div>
                `;
                grid.appendChild(card);
            });

            // 아이콘 새로고침
            lucide.createIcons();
        }

        // === 4. 필터 및 정렬 기능 ===
        function filterPlaces() {
            if (activeTab === "전체") {
                currentPlaces = [...placesData];
            } else {
                currentPlaces = placesData.filter(p => p.district === activeTab);
            }
            renderCategories(); // 버튼 상태 업데이트
            renderPlaces(); // 목록 새로고침
        }

        function sortPlaces(criteria) {
            if (criteria === 'views') {
                currentPlaces.sort((a, b) => b.views - a.views);
            } else if (criteria === 'rating') {
                currentPlaces.sort((a, b) => b.rating - a.rating);
            } else {
                // 추천순 (기본 순서로 복귀하되, 현재 필터 유지)
                filterPlaces();
                return; 
            }
            renderPlaces();
        }

        // === 5. 모달 기능 ===
        function openModal(place) {
            const modal = document.getElementById("detail-modal");
            const content = document.getElementById("modal-content");
            
            const tagsHtml = place.tags.map(tag => `<span class="text-sm bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-full shadow-sm font-medium">#${tag}</span>`).join("");

            content.innerHTML = `
                <div class="w-full h-72 md:h-[500px] relative bg-gray-100">
                    <img src="${place.image}" class="w-full h-full object-cover">
                    <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6 md:p-8 text-white">
                        <div class="flex items-center gap-2 mb-2">
                             <span class="px-2.5 py-1 bg-emerald-600 text-white text-xs font-bold rounded-md shadow-sm">${place.district}</span>
                             <div class="flex items-center text-yellow-400 text-sm font-bold bg-black/30 px-2 py-0.5 rounded-md backdrop-blur-sm">
                                <i data-lucide="star" class="w-3 h-3 fill-yellow-400 mr-1"></i> ${place.rating}
                             </div>
                        </div>
                        <h1 class="text-3xl md:text-4xl font-extrabold text-white mb-2 shadow-sm">${place.name}</h1>
                    </div>
                </div>
                <div class="px-6 md:px-8 py-8 md:py-12 max-w-4xl mx-auto">
                    <div class="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
                        <div class="flex items-center text-gray-500 text-sm font-medium">
                            <i data-lucide="eye" class="w-4 h-4 mr-1.5"></i> ${place.views.toLocaleString()}명이 관심을 가졌어요
                        </div>
                    </div>
                    <div class="prose prose-lg max-w-none text-gray-700 mb-10 leading-relaxed whitespace-pre-line">${place.description}</div>
                    <div class="bg-gray-50 rounded-2xl p-6">
                        <h3 class="text-lg font-bold text-gray-900 mb-4 flex items-center">
                            <i data-lucide="navigation" class="mr-2 text-emerald-600"></i> 관련 태그
                        </h3>
                        <div class="flex flex-wrap gap-2.5">${tagsHtml}</div>
                    </div>
                </div>
            `;
            
            modal.classList.remove("hidden");
            document.body.style.overflow = "hidden"; // 스크롤 막기
            lucide.createIcons();
        }

        function closeModal() {
            document.getElementById("detail-modal").classList.add("hidden");
            document.body.style.overflow = "auto"; // 스크롤 풀기
        }

        // 초기 실행
        renderCategories();
        renderPlaces();
        lucide.createIcons();
    </script>
</body>
</html>
