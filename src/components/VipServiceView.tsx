import React from 'react';
import { 
  ShieldCheck, 
  Sparkles, 
  Award, 
  Thermometer, 
  Lock, 
  GraduationCap, 
  Plane, 
  PhoneCall, 
  Clock, 
  CheckCircle2, 
  ExternalLink 
} from 'lucide-react';
import { ExpressPackage } from '../types/express';

interface VipServiceViewProps {
  packages: ExpressPackage[];
  onSelectPackage: (pkgId: string) => void;
}

export const VipServiceView: React.FC<VipServiceViewProps> = ({
  packages,
  onSelectPackage
}) => {
  const categories = [
    {
      id: 'confidential',
      title: '重点机要政务公文专递',
      badge: '保密特级',
      badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
      icon: Lock,
      iconColor: 'bg-rose-50 text-rose-600',
      description: '面向各级党政军机关、企事业单位核心公文与招投标文件的特级专送通道。',
      standards: [
        '双人武装专车押运与专属交接封条',
        '全流程高清无死角音视频监控调度',
        '严禁中途私自开箱，直达机要收发室',
        '收发专员持工作证与专用印信当面验视'
      ],
      samplePkg: packages.find(p => p.vipLevel === 'vip_confidential' || p.vipLevel === 'vip_government')
    },
    {
      id: 'admission',
      title: '高考录取通知书绿色通道',
      badge: '国脉所系',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
      icon: GraduationCap,
      iconColor: 'bg-amber-50 text-amber-600',
      description: '为全国高校录取通知书开辟的最高优先级绿色邮路保障体系。',
      standards: [
        '全网单号独立物理袋牌置顶与优先配载',
        '投递员出班前 100% 电话提前预约本人',
        '必须当面严格核对考生身份证件与准考证',
        '妥投签收时秒级触发家长短信及教育部系统对接'
      ],
      samplePkg: packages.find(p => p.serviceType === '考录录取通知书')
    },
    {
      id: 'fresh',
      title: '极速鲜生物/冷链温控专递',
      badge: '全程温控',
      badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-200',
      icon: Thermometer,
      iconColor: 'bg-cyan-50 text-cyan-600',
      description: '高附加值农特产、疫苗试剂及生鲜温控全程物联网遥测冷链专运。',
      standards: [
        '内置物联网温度传感记录仪，每5分钟回传温度',
        '专用恒温冷藏集装箱与冷链机坪直装直卸',
        '偏离温区范围即时声光自动报警响应',
        '专人专车限时预约派送，冰鲜品质如初'
      ],
      samplePkg: packages.find(p => p.vipLevel === 'vip_fresh')
    },
    {
      id: 'high_value',
      title: '高价值保价速递专线',
      badge: '足额保价',
      badgeColor: 'bg-[#F9B200]/20 text-[#946200] border-[#F9B200]/40',
      icon: Award,
      iconColor: 'bg-amber-50 text-amber-700',
      description: '针对贵金属、名贵钟表、重要印鉴与奢侈品的声明价值特快通道。',
      standards: [
        '一对一独立保价封袋与密码防伪签收单',
        '中国邮政自主货机夜航优先装载保障',
        '专属 VIP 专属理赔绿色通道与专席顾问',
        '投递员随身配备专用记录仪当场验视'
      ],
      samplePkg: packages.find(p => p.declaredValue && p.declaredValue > 0)
    }
  ];

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-[#005f32] via-[#00703C] to-[#004f2b] text-white rounded-2xl p-6 shadow-sm relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 text-emerald-200 text-xs font-semibold mb-3 border border-white/15">
            <Sparkles className="w-3.5 h-3.5 text-[#F9B200]" />
            <span>中国邮政特快物流 · 国家级重点综合保障</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            VIP 重点特快专项保障服务规范
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-emerald-100/80 leading-relaxed">
            秉持“人民邮政为人民”的优良传统与普遍服务承诺，为政务机要、高考招生、生命冷链与高保价邮件提供全天候专人、专车、专机最高级别运行保障。
          </p>
        </div>
      </div>

      {/* Grid of Special Service Standards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {categories.map(cat => {
          const Icon = cat.icon;
          return (
            <div 
              key={cat.id} 
              className="bg-white rounded-2xl border border-stone-200 shadow-xs p-5 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${cat.iconColor}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-stone-900">{cat.title}</h3>
                      <p className="text-xs text-stone-500 mt-0.5">{cat.description}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex-shrink-0 ${cat.badgeColor}`}>
                    {cat.badge}
                  </span>
                </div>

                <div className="mt-4 pt-4 border-t border-stone-100">
                  <div className="text-[11px] font-semibold text-stone-500 mb-2">服务作业保障标准：</div>
                  <ul className="space-y-1.5">
                    {cat.standards.map((std, i) => (
                      <li key={i} className="text-xs text-stone-700 flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <span>{std}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {cat.samplePkg && (
                <div className="mt-5 pt-3 border-t border-stone-100 bg-stone-50 -mx-5 -mb-5 p-4 rounded-b-2xl flex items-center justify-between">
                  <div className="min-w-0">
                    <div className="text-[10px] text-stone-400">系统内对应保障快件样例</div>
                    <div className="text-xs font-bold text-[#00703C] font-mono truncate">
                      {cat.samplePkg.trackingNumber} · {cat.samplePkg.itemName}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onSelectPackage(cat.samplePkg!.id)}
                    className="px-3 py-1.5 bg-[#00703C] hover:bg-[#005f32] text-white text-xs font-semibold rounded-lg flex items-center gap-1 shadow-xs transition-colors flex-shrink-0"
                  >
                    <span>跳转追踪</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Guarantee Hotline Card */}
      <div className="bg-stone-900 text-white rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <div className="text-xs text-emerald-400 font-bold uppercase tracking-wider">
            7×24小时专属应急调度指挥部
          </div>
          <div className="text-base font-bold text-white">
            全国重点邮件实时异常直通专席与航路调度指挥中心
          </div>
          <div className="text-xs text-stone-400">
            当遇台风暴雨恶劣天气或交通管制时，优先启动备用陆空接驳预案，确保时效无损。
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white/10 px-4 py-2.5 rounded-xl border border-white/10 text-center">
            <div className="text-[10px] text-stone-400">国家专递调度直拨</div>
            <div className="text-lg font-mono font-bold text-[#F9B200]">11183 - 按 8</div>
          </div>
        </div>
      </div>
    </div>
  );
};
