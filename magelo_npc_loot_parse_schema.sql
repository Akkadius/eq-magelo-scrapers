SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for magelo_npc_loot_parse
-- ----------------------------
DROP TABLE IF EXISTS `magelo_npc_loot_parse`;
CREATE TABLE `magelo_npc_loot_parse` (
  `zone_id` int(11) NOT NULL DEFAULT '0',
  `npc_name` varchar(70) NOT NULL DEFAULT '',
  `item_id` int(11) NOT NULL DEFAULT '0',
  `item_name` varchar(200) DEFAULT NULL,
  `zone_sn` varchar(100) DEFAULT NULL,
  `observed_drops` int(11) DEFAULT NULL,
  `total_observed_drops` int(11) DEFAULT NULL,
  `drop_rate` float(30,6) DEFAULT NULL,
  `npc_lvl_min` int(11) DEFAULT NULL,
  `npc_lvl_max` int(11) DEFAULT NULL,
  PRIMARY KEY (`zone_id`,`npc_name`,`item_id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;
