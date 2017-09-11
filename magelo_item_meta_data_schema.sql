SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for magelo_item_meta_data
-- ----------------------------
DROP TABLE IF EXISTS `magelo_item_meta_data`;
CREATE TABLE `magelo_item_meta_data` (
  `item_id` int(11) NOT NULL,
  `initial_entry_date_human` varchar(25) DEFAULT NULL,
  `initial_entry_date_unix` int(11) DEFAULT NULL,
  `last_updated_date_human` varchar(25) DEFAULT NULL,
  `last_updated_date_unix` int(11) DEFAULT NULL,
  PRIMARY KEY (`item_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
