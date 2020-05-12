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
  `name` char(50) DEFAULT NULL,
  `pay1` char(50) NOT NULL DEFAULT 'false',
  `pay2` char(50) NOT NULL DEFAULT 'false',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 테이블 데이터 delivery.account:~0 rows (대략적) 내보내기
/*!40000 ALTER TABLE `account` DISABLE KEYS */;
/*!40000 ALTER TABLE `account` ENABLE KEYS */;

-- 테이블 delivery.delirecord 구조 내보내기
CREATE TABLE IF NOT EXISTS `delirecord` (
  `id` int(11) NOT NULL,
  `denum` char(50) DEFAULT NULL,
  `sdate` char(50) DEFAULT NULL,
  `date` char(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 테이블 데이터 delivery.delirecord:~0 rows (대략적) 내보내기
/*!40000 ALTER TABLE `delirecord` DISABLE KEYS */;
/*!40000 ALTER TABLE `delirecord` ENABLE KEYS */;

-- 테이블 delivery.top 구조 내보내기
CREATE TABLE IF NOT EXISTS `top` (
  `code` char(50) DEFAULT NULL,
  `name` char(50) DEFAULT NULL,
  `lookup` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 테이블 데이터 delivery.top:~42 rows (대략적) 내보내기
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
	('99', '롯데글로벌 로지스(국제)', 0),
	('37', '범한판토스(국제)', 0),
	('29', '에어보이익스프레스(국제)', 0),
	('38', 'APEX(ECMS Express)(국제)', 0),
	('42', 'CJ대한통운 국제특송(국제)', 0),
	('57', 'Cway Express(국제)', 0),
	('11', '일양로지스', 0),
	('13', 'DHL(국제)', 0),
	('33', 'DGL Global Mail(국제)', 0),
	('12', 'EMS(국제)', 0),
	('21', 'Fedex', 0),
	('41', 'GSI Express(국제)', 0),
	('28', 'GSMNtoN(인로스)(국제)', 0),
	('34', 'i-Parcel(국제)', 0),
	('25', 'TNT Express(국제)', 0),
	('55', 'EuroParcel(유료택배)(국제)', 0),
	('14', 'UPS(국제)', 0),
	('26', 'USPS(국제)', 0),
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
	('99', '롯데글로벌 로지스(국제)', 0),
	('37', '범한판토스(국제)', 0),
	('29', '에어보이익스프레스(국제)', 0),
	('38', 'APEX(ECMS Express)(국제)', 0),
	('42', 'CJ대한통운 국제특송(국제)', 0),
	('57', 'Cway Express(국제)', 0),
	('11', '일양로지스', 0),
	('13', 'DHL(국제)', 0),
	('33', 'DGL Global Mail(국제)', 0),
	('12', 'EMS(국제)', 0),
	('21', 'Fedex', 0),
	('41', 'GSI Express(국제)', 0),
	('28', 'GSMNtoN(인로스)(국제)', 0),
	('34', 'i-Parcel(국제)', 0),
	('25', 'TNT Express(국제)', 0),
	('55', 'EuroParcel(유료택배)(국제)', 0),
	('14', 'UPS(국제)', 0),
	('26', 'USPS(국제)', 0);
/*!40000 ALTER TABLE `top` ENABLE KEYS */;

/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
