'use client'

/**
 * 背景效果组件
 *
 * 提供页面背景的装饰效果:
 * 1. 点阵图案 - 20x20px 网格的淡紫色圆点
 * 2. 动态光球 - 三个渐变光球,使用脉冲动画
 *    - 紫色光球(左上)
 *    - 青色光球(右上,延迟 2s)
 *    - 粉色光球(底部中间,延迟 4s)
 *
 * 视觉效果:
 * - 使用 mix-blend-multiply 混合模式
 * - 模糊滤镜创造柔和光晕
 * - 低透明度避免干扰内容
 * - 脉冲动画营造动感
 */
export function BackgroundEffects() {
  return (
    <>
      {/* 背景点阵 */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(156,146,172,0.15) 1px, transparent 0)',
          backgroundSize: '20px 20px'
        }}></div>
      </div>

      {/* 动态光效 */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-600 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>
    </>
  )
}
