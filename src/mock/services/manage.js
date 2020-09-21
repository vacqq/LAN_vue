import Mock from 'mockjs2'
import { builder, getQueryParameters } from '../util'

const totalCount = 5701

const serverList = (options) => {
  const parameters = getQueryParameters(options)

  const result = []
  const pageNo = parseInt(parameters.pageNo)
  const pageSize = parseInt(parameters.pageSize)
  const totalPage = Math.ceil(totalCount / pageSize)
  const key = (pageNo - 1) * pageSize
  const next = (pageNo >= totalPage ? (totalCount % pageSize) : pageSize) + 1

  for (let i = 1; i < next; i++) {
    const tmpKey = key + i
    result.push({
      key: tmpKey,
      id: tmpKey,
      no: 'No ' + tmpKey,
      description: '这是一段描述',
      callNo: Mock.mock('@integer(1, 999)'),
      status: Mock.mock('@integer(0, 3)'),
      updatedAt: Mock.mock('@datetime'),
      editable: false
    })
  }

  return builder({
    pageSize: pageSize,
    pageNo: pageNo,
    totalCount: totalCount,
    totalPage: totalPage,
    data: result
  })
}

const projects = () => {
  return builder({
    'data': [{
      id: 1,
      cover: 'https://gw.alipayobjects.com/zos/rmsportal/ComBAopevLwENQdKWiIn.png',
      title: '老李软件',
      description: '局域网平台开发，正在进行中',
      status: 1,
      updatedAt: '2020-08-7 00:00:00'
    },
    ],
    'pageSize': 10,
    'pageNo': 0,
    'totalPage': 6,
    'totalCount': 57
  })
}

const activity = () => {
  return builder([{
    id: 1,
    user: {
      nickname: '李聪卓',
      avatar: 'https://gw.alipayobjects.com/zos/rmsportal/BiazfanxmamNRoxxVxka.png'
    },
    project: {
      name: '局域网组',
      action: '更新',
      event: '首页显示'
    },
    time: '2020-08-07 14:47:00'
  },
  {
    id: 1,
    user: {
      nickname: '刘建军',
      avatar: 'https://gw.alipayobjects.com/zos/rmsportal/jZUIxmJycoymBprLOUbT.png'
    },
    project: {
      name: '局域网组',
      action: '更新',
      event: '热力图'
    },
    time: '2020-08-07 14:47:00'
  },
    // {
    //   id: 1,
    //   user: {
    //     nickname: '@name',
    //     avatar: '@image(64x64)'
    //   },
    //   project: {
    //     name: '白鹭酱油开发组',
    //     action: '创建',
    //     event: '番组计划'
    //   },
    //   time: '2017-05-27 00:00:00'
    // },
    // {
    //   id: 1,
    //   user: {
    //     nickname: '曲丽丽',
    //     avatar: '@image(64x64)'
    //   },
    //   project: {
    //     name: '高逼格设计天团',
    //     action: '更新',
    //     event: '六月迭代'
    //   },
    //   time: '2018-08-23 14:47:00'
    // },
    // {
    //   id: 1,
    //   user: {
    //     nickname: '@name',
    //     avatar: '@image(64x64)'
    //   },
    //   project: {
    //     name: '高逼格设计天团',
    //     action: 'created',
    //     event: '六月迭代'
    //   },
    //   time: '2018-08-23 14:47:00'
    // },
    // {
    //   id: 1,
    //   user: {
    //     nickname: '曲丽丽',
    //     avatar: 'https://gw.alipayobjects.com/zos/rmsportal/BiazfanxmamNRoxxVxka.png'
    //   },
    //   project: {
    //     name: '高逼格设计天团',
    //     action: 'created',
    //     event: '六月迭代'
    //   },
    //   time: '2018-08-23 14:47:00'
    // }
  ])
}

const teams = () => {
  return builder([{
    id: 1,
    name: '老李软件组',
    avatar: 'https://gw.alipayobjects.com/zos/rmsportal/BiazfanxmamNRoxxVxka.png'
  },
  ])
}

const radar = () => {
  return builder([{
    item: '引用',
    '个人': 70,
    '团队': 30,
    '部门': 40
  },
  {
    item: '口碑',
    '个人': 60,
    '团队': 70,
    '部门': 40
  },
  {
    item: '产量',
    '个人': 50,
    '团队': 60,
    '部门': 40
  },
  {
    item: '贡献',
    '个人': 40,
    '团队': 50,
    '部门': 40
  },
  {
    item: '热度',
    '个人': 60,
    '团队': 70,
    '部门': 40
  },
  {
    item: '引用',
    '个人': 70,
    '团队': 50,
    '部门': 40
  }
  ])
}

Mock.mock(/\/service/, 'get', serverList)
Mock.mock(/\/list\/search\/projects/, 'get', projects)
Mock.mock(/\/workplace\/activity/, 'get', activity)
Mock.mock(/\/workplace\/teams/, 'get', teams)
Mock.mock(/\/workplace\/radar/, 'get', radar)
