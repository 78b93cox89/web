<template>
  <div>
    <div class="about">
      <h2>
        关于 ManyACG
      </h2>
      <h3>1. 这是什么?</h3>
      <p>
        ManyACG 是1个个人向二次元图片分享网站, 所有图片都来自站长关注的画师&收藏, 不是随便爬取的哦 !
      </p>
      <h3>2. 注册登录有什么用?</h3>
      <p>
        点赞暂时需要登录, 未来可能会移除限制. 其他没了.
        <br />
        因为此前我一直运营着一个 Telegram ACG 插画频道, 所以目前写了 Telegram 登录和 Email 登录.
        <br />
        关注 Telegram 频道 <var-link href="https://moreacg.t.me" class="link" target="_blank">@MoreACG</var-link>
        可以第一时间看到新图
        <br />
        你问为什么频道叫 MoreACG 而不是 ManyACG ? 因为 ManyACG 已经被杜叔叔封了...
      </p>
      <h3>3. 搜索功能有什么用法</h3>
      <p>
        作品相关的一切文本信息都会被搜索, 并支持使用逻辑参数, 格式如下:
        <br />
        使用 ',' 分隔或关系, 使用 ';' 分隔与关系, 示例:
        <br />
        <code>Miku,初音未来;双马尾,JK</code>
        <br />
        会搜索包含 <code>Miku</code> <b>或</b> <code>初音未来</code>, <b>且</b>包含 <code>双马尾</code> <b>或</b> <code>JK</code> 的图片
      </p>
      <h3>4. 随机图片API</h3>
      <p>
        直接跳转到图片: <br />
        <var-link href="https://manyacg.top/setu" class="link" target="_blank">manyacg.top/setu</var-link> (默认无R18)
        <br />
        <var-link href="https://manyacg.top/sese" class="link" target="_blank">manyacg.top/sese</var-link> (含R18, 谨慎访问)
        <br />
        以json格式返回:
        <br />
        <var-link href="https://manyacg.top/api/v1/artwork/random" class="link"
          target="_blank">manyacg.top/api/v1/artwork/random</var-link>
      </p>
    </div>
  </div>
</template>

<script lang="ts" setup>
useHead({
  title: '关于',
})
</script>

<style scoped>
.about {
  margin: 0 auto;
  padding: 20px;
  max-width: 1200px;
  line-height: 2;
}

.link {
  text-decoration: none;
  white-space: nowrap;
  font: 1em sans-serif;
}

.link:after {
  content: "";
  position: absolute;
  z-index: -1;
  top: 77%;
  left: -0.1em;
  right: -0.1em;
  bottom: 0;
  transition: top 200ms cubic-bezier(0, 0.8, 0.13, 1);
  background-color: rgba(33, 214, 227, 0.6);
}

.link:hover:after {
  top: 0%;
}
</style>