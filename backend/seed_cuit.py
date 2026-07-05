"""
成都信息工程大学周边数据填充脚本
—— 资讯 + 商家 + 电话簿 三项数据写入 community_db
"""

from datetime import datetime, date, timezone

from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session

from config import settings
from database import Base
from models.category import Category
from models.news import News
from models.business import BusinessCategory, Business
from models.phone import PhoneCategory, PhoneEntry
from utils.sanitize import sanitize_html

engine = create_engine(settings.DATABASE_URL)


def seed_cuit():
    Base.metadata.create_all(bind=engine)

    with Session(engine) as db:
        now = datetime.now(timezone.utc)

        # =====================================================
        # 一、资讯 — 成都信息工程大学相关热点
        # =====================================================
        cat_announce = db.execute(
            select(Category).where(Category.name == "社区公告")
        ).scalar_one_or_none()
        cat_service = db.execute(
            select(Category).where(Category.name == "便民服务")
        ).scalar_one_or_none()
        cat_activity = db.execute(
            select(Category).where(Category.name == "活动资讯")
        ).scalar_one_or_none()
        cat_policy = db.execute(
            select(Category).where(Category.name == "政策解读")
        ).scalar_one_or_none()
        cat_notice = db.execute(
            select(Category).where(Category.name == "通知提醒")
        ).scalar_one_or_none()

        news_list = [
            {
                "title": "成都信息工程大学2024年秋季学期开学安排通告",
                "summary": "为确保新学期各项工作顺利开展，现将2024年秋季学期开学时间、报到流程、宿舍安排等事项通知如下。",
                "content": sanitize_html(
                    "<h3>开学时间</h3>"
                    "<p>在校生：2024年9月2日（星期一）正式上课，8月31日-9月1日报到注册。</p>"
                    "<p>2024级新生：9月7日-8日报到，9月9日-20日军训，9月23日正式上课。</p>"
                    "<h3>报到流程</h3>"
                    "<p><b>航空港校区：</b>学府路一段24号，各学院报到点设于体育馆前广场。</p>"
                    "<p><b>龙泉校区：</b>阳光城幸福路10号，报到点设于行政楼一楼大厅。</p>"
                    "<h3>注意事项</h3>"
                    "<p>1. 新生凭录取通知书和身份证报到。</p>"
                    "<p>2. 宿舍于8月29日开放入住，提前到校的同学可联系辅导员安排临时住宿。</p>"
                    "<p>3. 如因特殊情况无法按时报到，需提前向所在学院请假。</p>"
                    "<h3>联系方式</h3>"
                    "<p>招生办：028-85966857 | 学生处：028-85966381</p>"
                ),
                "category_id": cat_announce.id if cat_announce else 1,
                "status": 1,
                "is_top": 1,
                "view_count": 328,
                "like_count": 15,
            },
            {
                "title": "航空港校区学府路段道路施工出行提醒",
                "summary": "接双流区交通局通知，学府路一段（机场路辅道至长江路段）将于8月15日起进行为期45天的路面改造，请师生注意绕行。",
                "content": sanitize_html(
                    "<h3>施工范围</h3>"
                    "<p>学府路一段（机场路辅道交叉口 至 长江路交叉口），全长约1.2公里。</p>"
                    "<h3>施工时间</h3>"
                    "<p>2024年8月15日 — 2024年9月30日（共45天）</p>"
                    "<p>每日施工时段：7:00-12:00、14:00-19:00</p>"
                    "<h3>出行建议</h3>"
                    "<p>1. <b>公交调整：</b>804路、806路、S18路临时取消信息工程学院站，请前往机场路学府路口站乘车。</p>"
                    "<p>2. <b>步行/骑行：</b>施工期间预留1.5米人行通道，建议高峰期绕行长江路或机场路辅道。</p>"
                    "<p>3. <b>驾车：</b>施工路段实行单向交替通行，建议绕行机场高速或大件路。</p>"
                    "<h3>咨询电话</h3>"
                    "<p>双流区交通局：028-85822110</p>"
                ),
                "category_id": cat_notice.id if cat_notice else 5,
                "status": 1,
                "is_top": 0,
                "view_count": 186,
                "like_count": 8,
            },
            {
                "title": "成都信息工程大学周边便民生活服务指南",
                "summary": "为方便广大师生和社区居民的日常生活，我们整理了航空港校区及龙泉校区周边最全的生活服务信息，涵盖餐饮、购物、医疗、快递等。",
                "content": sanitize_html(
                    "<h3>餐饮美食</h3>"
                    "<p>· <b>肯德基（学府路店）：</b>学府路一段38号，营业时间 07:00-23:00，电话 028-85871001</p>"
                    "<p>· <b>乡村基（双流店）：</b>机场路近都段12号附3号，营业时间 10:30-21:00，电话 028-85872002</p>"
                    "<p>· <b>袁记串串香（航空港店）：</b>长江路三段66号，营业时间 11:00-02:00，电话 028-85873003</p>"
                    "<p>· <b>茶百道（学府路店）：</b>学府路一段52号，营业时间 09:00-22:00</p>"
                    "<h3>购物超市</h3>"
                    "<p>· <b>红旗连锁（学府路店）：</b>学府路一段28号，24小时营业，电话 028-85874004</p>"
                    "<p>· <b>永辉超市（航空港店）：</b>机场路近都段88号负一楼，营业时间 08:00-22:00</p>"
                    "<h3>医疗健康</h3>"
                    "<p>· <b>一心堂（学府路店）：</b>学府路一段45号，营业时间 08:30-21:30，电话 028-85875005</p>"
                    "<p>· <b>双流区第一人民医院：</b>东升街道城北上街120号，电话 028-85812010</p>"
                    "<h3>快递物流</h3>"
                    "<p>· <b>菜鸟驿站（成信大店）：</b>航空港校区学生公寓3栋1楼，取件时间 09:00-21:00</p>"
                    "<p>· <b>顺丰速运（航空港营业部）：</b>机场路近都段35号，电话 95338</p>"
                ),
                "category_id": cat_service.id if cat_service else 2,
                "status": 1,
                "is_top": 1,
                "view_count": 452,
                "like_count": 23,
            },
            {
                "title": "成信大龙泉校区阳光城第三届社区美食文化节",
                "summary": "为丰富社区居民和在校师生的业余生活，龙泉校区阳光城将于9月下旬举办第三届社区美食文化节，欢迎广大居民踊跃参与。",
                "content": sanitize_html(
                    "<h3>活动信息</h3>"
                    "<p>· <b>时间：</b>2024年9月21日-23日 每日10:00-21:00</p>"
                    "<p>· <b>地点：</b>龙泉驿区阳光城幸福路广场（龙泉校区南门对面）</p>"
                    "<h3>活动内容</h3>"
                    "<p>1. <b>美食展销：</b>60+本地特色美食摊位，涵盖川菜、火锅、串串、小吃、甜品等。</p>"
                    "<p>2. <b>厨艺大赛：</b>社区居民与在校学生同台竞技，争夺'阳光厨神'称号。</p>"
                    "<p>3. <b>非遗体验：</b>糖画、面人、蜀绣等非遗传承人现场教学。</p>"
                    "<p>4. <b>文艺表演：</b>每晚19:00-20:30，社区文艺团队及学生社团轮番演出。</p>"
                    "<h3>参与方式</h3>"
                    "<p>免费入场，美食消费自理。厨艺大赛报名请到阳光城社区服务中心（幸福路32号）登记，截止9月18日。</p>"
                    "<h3>咨询电话</h3>"
                    "<p>阳光城社区服务中心：028-84831001</p>"
                ),
                "category_id": cat_activity.id if cat_activity else 3,
                "status": 1,
                "is_top": 0,
                "view_count": 215,
                "like_count": 42,
            },
            {
                "title": "双流区高校毕业生就业创业扶持政策解读",
                "summary": "双流区人社局发布最新版高校毕业生就业创业扶持政策，涵盖就业补贴、创业贷款、租房补助等多项福利，成信大毕业生可重点关注。",
                "content": sanitize_html(
                    "<h3>就业补贴</h3>"
                    "<p>· <b>一次性求职创业补贴：</b>符合条件的困难家庭毕业生可申请1500元/人。</p>"
                    "<p>· <b>灵活就业社保补贴：</b>离校2年内未就业高校毕业生灵活就业后，按实际缴纳社保费的60%给予补贴。</p>"
                    "<h3>创业扶持</h3>"
                    "<p>· <b>创业担保贷款：</b>个人最高可申请30万元，小微企业最高300万元，财政给予贴息。</p>"
                    "<p>· <b>创业补贴：</b>首次创业且正常经营1年以上，给予1万元一次性创业补贴。</p>"
                    "<h3>租房补助</h3>"
                    "<p>· 毕业5年内在双流区就业创业的全日制本科及以上学历毕业生，可申请每月600-1200元租房补贴，最长享受3年。</p>"
                    "<h3>申请方式</h3>"
                    "<p>登录成都市人力资源和社会保障局官网或前往双流区人才服务中心（东升街道正通路555号）窗口办理。</p>"
                    "<p>咨询电话：028-85811578</p>"
                ),
                "category_id": cat_policy.id if cat_policy else 4,
                "status": 1,
                "is_top": 0,
                "view_count": 173,
                "like_count": 19,
            },
        ]

        for item in news_list:
            existing = db.execute(
                select(News).where(News.title == item["title"])
            ).scalar_one_or_none()
            if existing is None:
                news = News(
                    title=item["title"],
                    summary=item["summary"],
                    content=item["content"],
                    category_id=item["category_id"],
                    status=item["status"],
                    is_top=item.get("is_top", 0),
                    view_count=item.get("view_count", 0),
                    like_count=item.get("like_count", 0),
                    created_at=now,
                    updated_at=now,
                )
                db.add(news)

        db.commit()
        print("资讯数据已插入")

        # =====================================================
        # 二、商家 — 成都信息工程大学航空港校区周边
        # =====================================================
        bc_food = db.execute(
            select(BusinessCategory).where(BusinessCategory.name == "餐饮美食")
        ).scalar_one_or_none()
        bc_store = db.execute(
            select(BusinessCategory).where(BusinessCategory.name == "超市便利店")
        ).scalar_one_or_none()
        bc_beauty = db.execute(
            select(BusinessCategory).where(BusinessCategory.name == "美容美发")
        ).scalar_one_or_none()
        bc_home = db.execute(
            select(BusinessCategory).where(BusinessCategory.name == "家政服务")
        ).scalar_one_or_none()
        bc_repair = db.execute(
            select(BusinessCategory).where(BusinessCategory.name == "维修服务")
        ).scalar_one_or_none()
        bc_pharmacy = db.execute(
            select(BusinessCategory).where(BusinessCategory.name == "药店诊所")
        ).scalar_one_or_none()
        bc_edu = db.execute(
            select(BusinessCategory).where(BusinessCategory.name == "教育培训")
        ).scalar_one_or_none()
        bc_entertain = db.execute(
            select(BusinessCategory).where(BusinessCategory.name == "休闲娱乐")
        ).scalar_one_or_none()

        business_list = [
            {
                "category_id": bc_food.id if bc_food else 1,
                "name": "肯德基（学府路店）",
                "logo": "",
                "description": "国际连锁快餐品牌，提供炸鸡、汉堡、薯条等西式快餐，支持堂食、外带及外卖配送。",
                "address": "成都市双流区学府路一段38号",
                "phone": "028-85871001",
                "business_hours": "07:00-23:00",
            },
            {
                "category_id": bc_food.id if bc_food else 1,
                "name": "袁记串串香（航空港店）",
                "logo": "",
                "description": "成都本地知名串串香品牌，百余种菜品自选，秘制锅底鲜香麻辣，深受成信大学生喜爱。",
                "address": "成都市双流区长江路三段66号",
                "phone": "028-85873003",
                "business_hours": "11:00-次日02:00",
            },
            {
                "category_id": bc_food.id if bc_food else 1,
                "name": "乡村基（双流航空港店）",
                "logo": "",
                "description": "中式快餐连锁品牌，主打川味套餐、米线、盖饭等，性价比高，学生消费首选。",
                "address": "成都市双流区机场路近都段12号附3号",
                "phone": "028-85872002",
                "business_hours": "10:30-21:00",
            },
            {
                "category_id": bc_food.id if bc_food else 1,
                "name": "茶百道（学府路店）",
                "logo": "",
                "description": "成都本土新式茶饮品牌，主打鲜果茶、芝士奶盖茶，学生聚集热门地。",
                "address": "成都市双流区学府路一段52号",
                "phone": "028-85876006",
                "business_hours": "09:00-22:00",
            },
            {
                "category_id": bc_store.id if bc_store else 2,
                "name": "红旗连锁（学府路店）",
                "logo": "",
                "description": "成都本土便利连锁超市，24小时营业，提供日用百货、食品饮料、公交卡充值及水电缴费服务。",
                "address": "成都市双流区学府路一段28号",
                "phone": "028-85874004",
                "business_hours": "24小时营业",
            },
            {
                "category_id": bc_store.id if bc_store else 2,
                "name": "永辉超市（航空港店）",
                "logo": "",
                "description": "全国连锁大型综合超市，生鲜、食品、日用品一应俱全，支持线上线下购物。",
                "address": "成都市双流区机场路近都段88号B1层",
                "phone": "028-85811233",
                "business_hours": "08:00-22:00",
            },
            {
                "category_id": bc_pharmacy.id if bc_pharmacy else 6,
                "name": "一心堂（学府路店）",
                "logo": "",
                "description": "全国连锁药房，经营中西成药、保健品、医疗器械，提供免费测量血压及用药咨询服务。",
                "address": "成都市双流区学府路一段45号",
                "phone": "028-85875005",
                "business_hours": "08:30-21:30",
            },
            {
                "category_id": bc_pharmacy.id if bc_pharmacy else 6,
                "name": "德仁堂（航空港店）",
                "logo": "",
                "description": "成都百年老字号药房，中医坐诊，中药配方颗粒代煎，中西成药齐全。",
                "address": "成都市双流区长江路一段21号",
                "phone": "028-85877007",
                "business_hours": "08:00-21:00",
            },
            {
                "category_id": bc_edu.id if bc_edu else 7,
                "name": "中公教育（双流分校）",
                "logo": "",
                "description": "全国性职业教育培训机构，提供公务员、事业单位、教师资格证等考试培训辅导。",
                "address": "成都市双流区东升街道棠湖北路一段78号2楼",
                "phone": "028-85878008",
                "business_hours": "09:00-18:00（周末正常营业）",
            },
            {
                "category_id": bc_edu.id if bc_edu else 7,
                "name": "新东方（双流校区）",
                "logo": "",
                "description": "知名教育培训机构，开设考研、四六级、雅思托福、IT培训等课程，成信大学员享专属优惠。",
                "address": "成都市双流区航空港锦华路二段166号",
                "phone": "028-85879009",
                "business_hours": "09:00-20:30",
            },
            {
                "category_id": bc_beauty.id if bc_beauty else 3,
                "name": "椰岛造型（航空港店）",
                "logo": "",
                "description": "全国连锁美发品牌，提供剪发、烫染、造型设计及头皮护理服务。",
                "address": "成都市双流区学府路一段36号2楼",
                "phone": "028-85880010",
                "business_hours": "10:00-21:00",
            },
            {
                "category_id": bc_home.id if bc_home else 4,
                "name": "顺丰速运（航空港营业部）",
                "logo": "",
                "description": "全国快递物流品牌，提供寄件、收件、大件物流等服务，成信大师生寄件享学生价。",
                "address": "成都市双流区机场路近都段35号",
                "phone": "95338",
                "business_hours": "08:00-19:00",
            },
            {
                "category_id": bc_repair.id if bc_repair else 5,
                "name": "华为授权服务中心（双流店）",
                "logo": "",
                "description": "华为官方售后服务点，提供手机、平板、电脑等产品维修、检测及配件销售。",
                "address": "成都市双流区东升街道南昌路99号",
                "phone": "028-85881011",
                "business_hours": "09:00-18:00",
            },
            {
                "category_id": bc_entertain.id if bc_entertain else 8,
                "name": "万达影城（双流明城店）",
                "logo": "",
                "description": "万达旗下连锁影院，含IMAX、杜比全景声等影厅，成信大学生凭学生证购票享半价优惠。",
                "address": "成都市双流区东升街道星空路999号万达广场4楼",
                "phone": "028-85882012",
                "business_hours": "10:00-23:30",
            },
        ]

        for item in business_list:
            existing = db.execute(
                select(Business).where(Business.name == item["name"])
            ).scalar_one_or_none()
            if existing is None:
                biz = Business(
                    category_id=item["category_id"],
                    name=item["name"],
                    logo=item["logo"],
                    description=item["description"],
                    address=item["address"],
                    phone=item["phone"],
                    business_hours=item["business_hours"],
                    status=1,
                    created_at=now,
                    updated_at=now,
                )
                db.add(biz)

        db.commit()
        print("商家数据已插入")

        # =====================================================
        # 三、电话簿 — 成都信息工程大学周边常用电话
        # =====================================================
        pc_emergency = db.execute(
            select(PhoneCategory).where(PhoneCategory.name == "紧急求助")
        ).scalar_one_or_none()
        pc_property = db.execute(
            select(PhoneCategory).where(PhoneCategory.name == "物业服务")
        ).scalar_one_or_none()
        pc_life = db.execute(
            select(PhoneCategory).where(PhoneCategory.name == "生活服务")
        ).scalar_one_or_none()
        pc_gov = db.execute(
            select(PhoneCategory).where(PhoneCategory.name == "政府部门")
        ).scalar_one_or_none()
        pc_medical = db.execute(
            select(PhoneCategory).where(PhoneCategory.name == "医疗健康")
        ).scalar_one_or_none()
        pc_edu2 = db.execute(
            select(PhoneCategory).where(PhoneCategory.name == "教育培训")
        ).scalar_one_or_none()

        phone_entries = [
            {
                "category_id": pc_emergency.id if pc_emergency else 1,
                "name": "报警电话",
                "phone": "110",
                "description": "双流区公安局航空港派出所",
            },
            {
                "category_id": pc_emergency.id if pc_emergency else 1,
                "name": "火警电话",
                "phone": "119",
                "description": "成都消防双流大队航空港中队",
            },
            {
                "category_id": pc_emergency.id if pc_emergency else 1,
                "name": "急救中心",
                "phone": "120",
                "description": "成都市急救指挥中心",
            },
            {
                "category_id": pc_property.id if pc_property else 2,
                "name": "成信大后勤服务热线",
                "phone": "028-85966515",
                "description": "宿舍报修、水电维修、食堂投诉等",
            },
            {
                "category_id": pc_property.id if pc_property else 2,
                "name": "成信大保卫处",
                "phone": "028-85966110",
                "description": "航空港校区24小时校园安保",
            },
            {
                "category_id": pc_life.id if pc_life else 3,
                "name": "菜鸟驿站（成信大站）",
                "phone": "18113001234",
                "description": "航空港校区学生公寓3栋1楼，代收代寄快递",
            },
            {
                "category_id": pc_life.id if pc_life else 3,
                "name": "顺丰速运（航空港营业部）",
                "phone": "95338",
                "description": "机场路近都段35号，快递收发",
            },
            {
                "category_id": pc_life.id if pc_life else 3,
                "name": "学府路红旗连锁",
                "phone": "028-85874004",
                "description": "学府路一段28号，24小时便利购物/公交卡充值",
            },
            {
                "category_id": pc_medical.id if pc_medical else 5,
                "name": "双流区第一人民医院",
                "phone": "028-85812010",
                "description": "东升街道城北上街120号，三级乙等综合医院",
            },
            {
                "category_id": pc_medical.id if pc_medical else 5,
                "name": "成都双流仁港医院",
                "phone": "028-85862052",
                "description": "机场路近都段16号，距成信大航空港校区约600米",
            },
            {
                "category_id": pc_gov.id if pc_gov else 4,
                "name": "学府路社区服务中心",
                "phone": "028-85831001",
                "description": "学府路一段60号，居民事务、社保、计生等综合服务",
            },
            {
                "category_id": pc_gov.id if pc_gov else 4,
                "name": "双流区公安局航空港派出所",
                "phone": "028-85868009",
                "description": "机场路近都段78号，户籍办理、治安管理",
            },
            {
                "category_id": pc_edu2.id if pc_edu2 else 6,
                "name": "成都信息工程大学招生办",
                "phone": "028-85966857",
                "description": "本科及研究生招生咨询",
            },
            {
                "category_id": pc_edu2.id if pc_edu2 else 6,
                "name": "成都信息工程大学教务处",
                "phone": "028-85966381",
                "description": "学籍管理、成绩查询、选课咨询",
            },
        ]

        for item in phone_entries:
            existing = db.execute(
                select(PhoneEntry).where(
                    PhoneEntry.name == item["name"],
                    PhoneEntry.phone == item["phone"],
                )
            ).scalar_one_or_none()
            if existing is None:
                entry = PhoneEntry(
                    category_id=item["category_id"],
                    name=item["name"],
                    phone=item["phone"],
                    description=item.get("description", ""),
                    created_at=now,
                    updated_at=now,
                )
                db.add(entry)

        db.commit()
        print("电话簿数据已插入")
        print("---")
        print("成都信息工程大学周边数据填充完成！")


if __name__ == "__main__":
    seed_cuit()
