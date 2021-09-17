-- --------------------------------------------------------
-- 호스트:                          127.0.0.1
-- 서버 버전:                        10.4.11-MariaDB - Source distribution
-- 서버 OS:                        Linux
-- HeidiSQL 버전:                  11.0.0.5919
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;


-- delivery 데이터베이스 구조 내보내기
CREATE DATABASE IF NOT EXISTS `delivery` /*!40100 DEFAULT CHARACTER SET utf8mb4 */;
USE `delivery`;

-- 테이블 delivery.account 구조 내보내기
CREATE TABLE IF NOT EXISTS `account` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userid` char(50) DEFAULT NULL,
  `userpass` char(50) DEFAULT NULL,
  `phone` char(50) DEFAULT NULL,
  `email` char(50) DEFAULT NULL,
  `name` char(50) DEFAULT NULL,
  `pay1` char(50) NOT NULL DEFAULT 'false',
  `pay2` char(50) NOT NULL DEFAULT 'false',
  `newpass` char(50) NOT NULL DEFAULT 'false',
  `seller` char(50) NOT NULL DEFAULT 'false',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4;

-- 테이블 데이터 delivery.account:~3 rows (대략적) 내보내기
/*!40000 ALTER TABLE `account` DISABLE KEYS */;
INSERT INTO `account` (`id`, `userid`, `userpass`, `phone`, `email`, `name`, `pay1`, `pay2`, `newpass`, `seller`) VALUES
	(1, 'omh02033', 'omh12255', '01040389960', 'omh02033@naver.com', '오명훈', 'false', 'false', 'false', 'true'),
	(2, 'ojs05233', 'ojs-04200', '01098780523', 'ojs05233@naver.com', '김미정', 'false', 'false', 'false', 'false'),
	(3, 'root', 'root', '01040389960', 'root@root.com', '루트', 'false', 'false', 'false', 'true');
/*!40000 ALTER TABLE `account` ENABLE KEYS */;

-- 테이블 delivery.chat 구조 내보내기
CREATE TABLE IF NOT EXISTS `chat` (
  `id` int(11) DEFAULT NULL,
  `denum` char(50) DEFAULT NULL,
  `scontent` char(250) DEFAULT NULL,
  `ccontent` char(250) DEFAULT NULL,
  `date` char(50) DEFAULT NULL,
  `time` char(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 테이블 데이터 delivery.chat:~0 rows (대략적) 내보내기
/*!40000 ALTER TABLE `chat` DISABLE KEYS */;
/*!40000 ALTER TABLE `chat` ENABLE KEYS */;

-- 테이블 delivery.delirecord 구조 내보내기
CREATE TABLE IF NOT EXISTS `delirecord` (
  `id` int(11) DEFAULT NULL,
  `denum` char(50) DEFAULT NULL,
  `tcode` char(50) DEFAULT NULL,
  `toolname` char(100) DEFAULT NULL,
  `result` int(11) DEFAULT NULL,
  `phonenum` char(50) DEFAULT NULL,
  `manname` char(50) DEFAULT NULL,
  `receiverName` char(50) DEFAULT NULL,
  `where` char(50) DEFAULT NULL,
  `date` char(50) DEFAULT NULL,
  `pdate` char(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 테이블 데이터 delivery.delirecord:~0 rows (대략적) 내보내기
/*!40000 ALTER TABLE `delirecord` DISABLE KEYS */;
INSERT INTO `delirecord` (`id`, `denum`, `tcode`, `toolname`, `result`, `phonenum`, `manname`, `receiverName`, `where`, `date`, `pdate`) VALUES
	(3, '380160267435', '04', '워밍업 탄력 통굽샌들(2종택1)_[스트라이프_화이트,235_240(M)] 1개', 6, '01054182140', '이범석', '김미*', '경기평택청북', '7', '2020년 7월 5일');
/*!40000 ALTER TABLE `delirecord` ENABLE KEYS */;

-- 테이블 delivery.payment 구조 내보내기
CREATE TABLE IF NOT EXISTS `payment` (
  `id` int(11) DEFAULT NULL,
  `toolname` char(50) DEFAULT NULL,
  `pay` int(11) DEFAULT NULL,
  `card_name` char(50) DEFAULT NULL,
  `card_no` char(50) DEFAULT NULL,
  `n` char(50) DEFAULT NULL,
  `receipt_id` char(50) DEFAULT NULL,
  `purchased_at` char(50) DEFAULT NULL,
  `status` char(50) DEFAULT NULL,
  `pg` char(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 테이블 데이터 delivery.payment:~1 rows (대략적) 내보내기
/*!40000 ALTER TABLE `payment` DISABLE KEYS */;
INSERT INTO `payment` (`id`, `toolname`, `pay`, `card_name`, `card_no`, `n`, `receipt_id`, `purchased_at`, `status`, `pg`) VALUES
	(1, '국제 택배 조회', 1200, 'NH', '4854800300008805', '국제 택배 조회', '5f092e0e5ade16002540a56d', '2020-07-11 12:12:52', 'complete', '다날');
/*!40000 ALTER TABLE `payment` ENABLE KEYS */;

-- 테이블 delivery.sellerdb 구조 내보내기
CREATE TABLE IF NOT EXISTS `sellerdb` (
  `id` int(11) DEFAULT NULL,
  `name` char(50) DEFAULT NULL,
  `denum` char(50) DEFAULT NULL,
  `toolname` char(100) DEFAULT NULL,
  `estimated` char(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 테이블 데이터 delivery.sellerdb:~0 rows (대략적) 내보내기
/*!40000 ALTER TABLE `sellerdb` DISABLE KEYS */;
/*!40000 ALTER TABLE `sellerdb` ENABLE KEYS */;

-- 테이블 delivery.subsc 구조 내보내기
CREATE TABLE IF NOT EXISTS `subsc` (
  `id` int(11) DEFAULT NULL,
  `userid` char(50) DEFAULT NULL,
  `username` char(50) DEFAULT NULL,
  `kinds` enum('국제 택배 조회','카카오톡 봇 이용','둘다 마음껏') DEFAULT NULL,
  `price` int(11) DEFAULT NULL,
  `purchased` char(50) DEFAULT NULL,
  `end_at` char(50) DEFAULT NULL,
  `recent_pay` char(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 테이블 데이터 delivery.subsc:~0 rows (대략적) 내보내기
/*!40000 ALTER TABLE `subsc` DISABLE KEYS */;
/*!40000 ALTER TABLE `subsc` ENABLE KEYS */;

-- 테이블 delivery.top 구조 내보내기
CREATE TABLE IF NOT EXISTS `top` (
  `code` char(50) DEFAULT NULL,
  `name` char(50) DEFAULT NULL,
  `lookup` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 테이블 데이터 delivery.top:~43 rows (대략적) 내보내기
/*!40000 ALTER TABLE `top` DISABLE KEYS */;
INSERT INTO `top` (`code`, `name`, `lookup`) VALUES
	('01', '우체국택배', 0),
	('04', 'CJ대한통운', 0),
	('05', '한진택배', 0),
	('06', '로젠택배', 0),
	('08', '롯데택배', 0),
	('16', '한의사랑택배', 0),
	('18', '건영택배', 0),
	('23', '경동택배', 0),
	('22', '대신택배', 0),
	('24', 'CVSnet 편의전택배', 0),
	('20', '한덱스', 0),
	('30', 'KGL네트웍스', 0),
	('32', '합동택배', 0),
	('40', '굿투럭', 0),
	('43', '애니트랙', 0),
	('44', 'SLX', 0),
	('46', 'CU편의점택배', 0),
	('45', '호남택배', 0),
	('52', '세방', 0),
	('53', '농협택배', 0),
	('54', '홈픽택배', 0),
	('56', 'KGB택배', 0),
	('58', '하이택배', 0),
	('17', '천일택배', 0),
	('64', 'FLF퍼레버택배', 0),
	('99', '롯데글로벌 로지', 0),
	('37', '범한판토스', 0),
	('29', '에어보이익스프레스', 0),
	('38', 'APEX(ECMS Express)', 0),
	('42', 'CJ대한통운 국제특송', 0),
	('57', 'Cway Express', 0),
	('11', '일양로지스', 0),
	('13', 'DHL', 0),
	('33', 'DGL Global Mail', 0),
	('12', 'EMS', 0),
	('21', 'Fedex', 0),
	('41', 'GSI Express', 0),
	('28', 'GSMNtoN(인로스)', 0),
	('34', 'i-Parcel', 0),
	('25', 'TNT Express', 0),
	('55', 'EuroParcel(유료택배)', 0),
	('14', 'UPS', 0),
	('26', 'USPS', 0);
/*!40000 ALTER TABLE `top` ENABLE KEYS */;

/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
