import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import favoriteFilled from "../assets/img/favorite_white_filled.png";
import favoriteBorder from "../assets/img/favorite_white_border.png";
import create from "../assets/img/create.png";
import styled from "styled-components";
import {
  getKeep,
  getReview,
  getSimilar,
  getStatistics,
  keepToggle,
  whiskyDetail,
  getMyReview,
} from "../apis/whiskyDetail";
import { userState } from "../store/userStore";
import { useRecoilValue } from "recoil";
import { changeHeader, rollbackHeader } from "../hooks/changeHeader";

//import components
import WhiskyDetailInfo from "../components/whisky/WhiskyDetailInfo";
import WhiskyDetailReview from "../components/whisky/WhiskyDetailReview";
import WhiskySimilarList from "../components/whisky/WhiskySimilarList";
import Graph from "../components/common/Graph";
import { warning } from "../components/notify/notify";

const SButton = styled.button`
  width: 63px;
  height: 63px;

  border-radius: 50%;
  border: none;
  cursor: pointer;

  background: #f84f5a;
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
`;

const SButtonDiv = styled.div`
  position: sticky;
  left: 87vw;
  bottom: 50px;
  width: 63px;
  height: 120px;
`;

const SImg = styled.img`
  width: 33px;
  height: 33px;
  cursor: pointer;
`;

const SP = styled.p`
  font-size: 24px;
  font-weight: 600;
`;

const SContainer = styled.div`
  margin-top: 70px;
  max-width: 100%;
  width: 100vw;
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
  margin-bottom: 30px;
`;

const AppWhisky = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  // 페이지 mount시 네비게이션 바 이미지와 글씨 색 변경
  useEffect(() => {
    changeHeader();
    return () => {
      rollbackHeader();
    };
  }, []);

  // 위스키 정보 조회
  const [whisky, setWhisky] = useState(null);

  async function getWhiskyInfo(param) {
    try {
      const whiskyInfo = await whiskyDetail(param);
      setWhisky(whiskyInfo);
    } catch (error) {
      console.log("위스키 데이터 조회 실패");
    }
  }

  // 킵 여부 조회
  async function getKeepInfo(param) {
    try {
      const keepInfo = await getKeep(param);
      setIsKeep(keepInfo);
    } catch (error) {
      console.log("킵 정보 조회 실패");
    }
  }

  // 선호 통계 조회
  const [stat, setStat] = useState(null);

  async function getStatisticsInfo(param) {
    try {
      const statInfo = await getStatistics(param);
      if (statInfo) {
        statInfo.age =
          statInfo.age === "TWENTY"
            ? "20"
            : statInfo.age === "THIRTY"
            ? "30"
            : statInfo.age === "FORTY"
            ? "40"
            : statInfo.age === "FIFTY"
            ? "50"
            : "60";
        statInfo.gender = statInfo.gender === "MALE" ? "남성" : "여성";
      }
      setStat(statInfo);
    } catch (error) {
      console.log("선호 통계 조회 실패");
    }
  }

  // 유사 위스키 조회
  const [similarWhiskys, setSimilarWhiskys] = useState([]);

  async function getSimilarInfo(param) {
    try {
      const similarInfo = await getSimilar(param);
      setSimilarWhiskys(similarInfo);
    } catch (error) {
      console.log("유사 위스키 정보 조회 실패");
    }
  }

  // 리뷰 조회
  const [reviews, setReviews] = useState([]);

  async function getReviewInfo(id, baseId, reviewOrder) {
    let data;
    if (baseId) {
      data = {
        baseId,
        reviewOrder,
      };
    } else {
      data = {
        reviewOrder,
      };
    }
    try {
      const reviewInfo = await getReview(id, data);
      console.log(reviewInfo);
      setReviews((prev) => [...prev, ...reviewInfo]);
    } catch (error) {
      console.log("리뷰 정보 조회 실패");
    }
  }

  // 나의 리뷰 조회
  const [myReview, setMyReview] = useState([]);
  async function getMyReviewInfo(param) {
    try {
      const myReviewInfo = await getMyReview(param);
      console.log(myReviewInfo);
      setMyReview(myReviewInfo);
    } catch (error) {
      console.log("나의 리뷰 조회 실패");
    }
  }

  const user = useRecoilValue(userState);
  const isLogin = Boolean(user.id);
  const [isKeep, setIsKeep] = useState(false);

  useEffect(() => {
    // 위스키 상세 조회 요청
    getWhiskyInfo(id);
    // 유사 위스키 목록 요청
    getSimilarInfo(id);
    // 통계 정보 요청
    getStatisticsInfo(id);
    // 리뷰 목록 요청
    getReviewInfo(id, 0, "LIKE");
    if (isLogin) {
      // 킵 여부 조회 요청
      getKeepInfo(id);
      // 나의 리뷰 목록 요청
      getMyReviewInfo(id);
    }
    window.scrollTo(0, 0);
  }, [id]);

  const favorite = () => {
    if (isLogin) {
      setIsKeep(!isKeep);
      keepToggle(id);
    }
    // } else if (window.confirm("로그인이 필요한 기능입니다.\n로그인 페이지로 이동하시겠습니까?")) {
    else {
      warning("로그인이 필요한 기능입니다!");
      navigate("/signin");
    }
  };

  return (
    <>
      <SContainer>
        {whisky && <WhiskyDetailInfo whisky={whisky} stat={stat} />}
        <div style={{ width: "990px", marginBottom: "0px", marginTop: "30px" }}>
          <SP>이 위스키는 이런 맛을 가지고 있어요!</SP>
        </div>
        {whisky && <Graph flavor={whisky.flavor} />}
        <div style={{ width: "990px", marginBottom: "0px", marginTop: "90px" }}>
          <SP>이런 위스키는 어떠세요?</SP>
        </div>
        {similarWhiskys.length ? <WhiskySimilarList whiskys={similarWhiskys} /> : null}
        <WhiskyDetailReview id={id} whisky={whisky} reviews={reviews} myReview={myReview} />
        <SButtonDiv>
          <SButton onClick={favorite} style={{ marginBottom: "10px" }}>
            <SImg src={isKeep ? favoriteFilled : favoriteBorder} alt="keep" />
          </SButton>
          <SButton onClick={() => navigate(`/review/${id}`)}>
            <SImg src={create} alt="create" />
          </SButton>
        </SButtonDiv>
      </SContainer>
    </>
  );
};

export default AppWhisky;
