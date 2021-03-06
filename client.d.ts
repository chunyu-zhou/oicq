// Project: https://github.com/takayama-lily/oicq

/// <reference types="node" />

import * as events from 'events';
import * as log4js from 'log4js';

export type Uin = string | number;

// 大多数情况下你无需关心这些配置项，因为默认配置就是最常用的，除非你需要一些与默认不同的规则
export interface ConfBot {
    log_level?: "trace" | "debug" | "info" | "warn" | "error" | "fatal" | "off", //默认info
    platform?: number, //1:安卓手机 2:aPad(默认) 3:安卓手表 4:Mac(实验性)
    kickoff?: boolean, //被挤下线是否在3秒后反挤对方，默认false
    ignore_self?: boolean,//群聊是否无视自己的发言，默认true
    resend?: boolean, //被风控时是否尝试用分片发送，默认true (一种古老的消息，暂不支持分片重组)
    data_dir?: string, //数据存储文件夹，需要可写权限，默认主目录下的data文件夹

    //触发system.offline.network事件后的重连间隔秒数，默认5(秒)，不建议设置低于3(秒)
    //瞬间的断线重连不会触发此事件，通常你的机器真的没有网络而导致断线时才会触发
    //设置为0则不会自动重连，然后你可以监听此事件自己处理
    reconn_interval?: number,

    //手动指定ip和port
    //默认使用msfwifi.3g.qq.com:8080进行连接，若要修改建议优先更改该域名hosts指向而不是手动指定ip
    //@link https://site.ip138.com/msfwifi.3g.qq.com/ 端口通常以下四个都会开放：80,443,8080,14000
    remote_ip?: string,
    remote_port?: number,
}

export interface Statistics {
    readonly start_time: number,
    readonly lost_times: number,
    readonly recv_pkt_cnt: number,
    readonly sent_pkt_cnt: number,
    readonly lost_pkt_cnt: number, //超时未响应的包
    readonly recv_msg_cnt: number,
    readonly sent_msg_cnt: number,
}

export interface Status {
    online: boolean,
    status: number,
    remote_ip?: number,
    remote_port?: number,
    msg_cnt_per_min: number,
    statistics: Statistics,
    config: ConfBot,
}

export type LoginInfo = StrangerInfo & VipInfo;

//////////

export interface RetError {
    code?: number,
    message?: string,
}
export interface RetCommon {
    retcode: number, //0ok 1async 100error 102failed 103timeout 104offline
    status: string, //"ok", "async", "failed"
    data: object | null,
    error?: RetError | null,
}

//////////

export interface VipInfo {
    readonly user_id?: number,
    readonly nickname?: string,
    readonly level?: number,
    readonly level_speed?: number,
    readonly vip_level?: number,
    readonly vip_growth_speed?: number,
    readonly vip_growth_total?: string,
}

export interface StrangerInfo {
    readonly user_id?: number,
    readonly nickname?: string,
    readonly sex?: string,
    readonly age?: number,
    readonly area?: string,
    readonly signature?: string,
    readonly description?: string,
    readonly group_id?: number,
}
export interface FriendInfo extends StrangerInfo {
    readonly remark?: string
}
export interface GroupInfo {
    readonly group_id?: number,
    readonly group_name?: string,
    readonly member_count?: number,
    readonly max_member_count?: number,
    readonly owner_id?: number,
    readonly last_join_time?: number,
    readonly last_sent_time?: number,
    readonly shutup_time_whole?: number, //全员禁言到期时间
    readonly shutup_time_me?: number, //我的禁言到期时间
    readonly create_time?: number,
    readonly grade?: number,
    readonly max_admin_count?: number,
    readonly active_member_count?: number,
    readonly update_time?: number, //当前群资料的最后更新时间
}
export interface MemberInfo {
    readonly group_id?: number,
    readonly user_id?: number,
    readonly nickname?: string,
    readonly card?: string,
    readonly sex?: string,
    readonly age?: number,
    readonly area?: string,
    readonly join_time?: number,
    readonly last_sent_time?: number,
    readonly level?: number,
    readonly rank?: string,
    readonly role?: string,
    readonly unfriendly?: boolean,
    readonly title?: string,
    readonly title_expire_time?: number,
    readonly card_changeable?: boolean,
    readonly shutup_time?: number, //禁言到期时间
    readonly update_time?: number, //此群员资料的最后更新时间
}
export interface MessageId {
    message_id: string
}

//////////

export interface RetStrangerList extends RetCommon {
    data: ReadonlyMap<number, StrangerInfo>
}
export interface RetFriendList extends RetCommon {
    data: ReadonlyMap<number, FriendInfo>
}
export interface RetGroupList extends RetCommon {
    data: ReadonlyMap<number, GroupInfo>
}
export interface RetMemberList extends RetCommon {
    data: ReadonlyMap<number, MemberInfo> | null
}
export interface RetStrangerInfo extends RetCommon {
    data: StrangerInfo | null
}
export interface RetGroupInfo extends RetCommon {
    data: GroupInfo | null
}
export interface RetMemberInfo extends RetCommon {
    data: MemberInfo | null
}
export interface RetSendMsg extends RetCommon {
    data: MessageId | null
}
export interface RetStatus extends RetCommon {
    data: Status
}
export interface RetLoginInfo extends RetCommon {
    data: LoginInfo
}

//////////

/**
 * @see https://github.com/howmanybots/onebot/blob/master/v11/specs/message/segment.md
 */
export interface MessageElem {
    type: string,
    data?: object,
}

export interface Anonymous {
    id: number,
    name: string,
    flag: string,
}

export interface EventData {
    self_id: number,
    time: number,
    post_type: string,
    system_type?: string,
    request_type?: string,
    message_type?: string,
    notice_type?: string,
    sub_type?: string,

    image?: Buffer,
    url?: string,

    message?: MessageElem | string,
    raw_message?: string,
    message_id?: string,
    user_id?: number,
    nickname?: string,
    group_id?: number,
    group_name?: string,
    discuss_id?: number,
    discuss_name?: string,
    font?: string,
    anonymous?: Anonymous | null,
    sender?: FriendInfo & MemberInfo,
    member?: MemberInfo,
    auto_reply?: boolean,

    flag?: string,
    comment?: string,
    source?: string,
    role?: string,

    inviter_id?: number,
    operator_id?: number,
    duration?: number,
    set?: boolean,
    dismiss?: boolean,
    signature?: string,
    title?: string,
    content?: string,
    action?: string,
    suffix?: string,
    enable_guest?: boolean,
    enable_anonymous?: boolean,
    enable_upload_album?: boolean,
    enable_upload_file?: boolean,
    enable_temp_chat?: boolean,
    enable_new_group?: boolean,
    enable_show_honor?: boolean,
    enable_show_level?: boolean,
    enable_show_title?: boolean,
    enable_confess?: boolean,
}

//////////

export class Client extends events.EventEmitter {

    private constructor();

    readonly uin: number;
    readonly password_md5: Buffer;
    readonly nickname: string;
    readonly sex: string;
    readonly age: number;
    readonly online_status: number;
    readonly fl: ReadonlyMap<number, FriendInfo>;
    readonly sl: ReadonlyMap<number, StrangerInfo>;
    readonly gl: ReadonlyMap<number, GroupInfo>;
    readonly gml: ReadonlyMap<number, ReadonlyMap<number, MemberInfo>>;
    readonly logger: log4js.Logger;
    readonly dir: string;
    readonly config: ConfBot;
    readonly stat: Statistics;

    login(password?: Buffer | string): void; //密码支持明文和md5
    captchaLogin(captcha: string): void;
    terminate(): void; //直接关闭连接
    logout(): Promise<void>; //先下线再关闭连接
    isOnline(): boolean;

    setOnlineStatus(status: number): Promise<RetCommon>; //11我在线上 31离开 41隐身 50忙碌 60Q我吧 70请勿打扰

    getFriendList(): RetFriendList;
    getStrangerList(): RetStrangerList;
    getGroupList(): RetGroupList;
    getGroupMemberList(group_id: Uin, no_cache?: boolean): Promise<RetMemberList>;
    getStrangerInfo(user_id: Uin, no_cache?: boolean): Promise<RetStrangerInfo>;
    getGroupInfo(group_id: Uin, no_cache?: boolean): Promise<RetGroupInfo>;
    getGroupMemberInfo(group_id: Uin, user_id: Uin, no_cache?: boolean): Promise<RetMemberInfo>;

    sendPrivateMsg(user_id: Uin, message: MessageElem[] | string, auto_escape?: boolean): Promise<RetSendMsg>;
    sendGroupMsg(group_id: Uin, message: MessageElem[] | string, auto_escape?: boolean): Promise<RetSendMsg>;
    sendDiscussMsg(discuss_id: Uin, message: MessageElem[] | string, auto_escape?: boolean): Promise<RetCommon>;
    deleteMsg(message_id: string): Promise<RetCommon>;
    getMsg(message_id: string): Promise<RetCommon>;

    sendGroupNotice(group_id: Uin, content: string): Promise<RetCommon>;
    setGroupName(group_id: Uin, group_name: string): Promise<RetCommon>;
    setGroupAnonymous(group_id: Uin, enable?: boolean): Promise<RetCommon>;
    setGroupWholeBan(group_id: Uin, enable?: boolean): Promise<RetCommon>;
    setGroupAdmin(group_id: Uin, user_id: Uin, enable?: boolean): Promise<RetCommon>;
    setGroupSpecialTitle(group_id: Uin, user_id: Uin, special_title?: string, duration?: number): Promise<RetCommon>;
    setGroupCard(group_id: Uin, user_id: Uin, card?: string): Promise<RetCommon>;
    setGroupKick(group_id: Uin, user_id: Uin, reject_add_request?: boolean): Promise<RetCommon>;
    setGroupBan(group_id: Uin, user_id: Uin, duration?: number): Promise<RetCommon>;
    setGroupLeave(group_id: Uin, is_dismiss?: boolean): Promise<RetCommon>;
    sendGroupPoke(group_id: Uin, user_id: Uin): Promise<RetCommon>; //group_id是好友时可以私聊戳一戳

    setFriendAddRequest(flag: string, approve?: boolean, remark?: string, block?: boolean): Promise<RetCommon>;
    setGroupAddRequest(flag: string, approve?: boolean, reason?: string, block?: boolean): Promise<RetCommon>;

    addGroup(group_id: Uin, comment?: string): Promise<RetCommon>;
    addFriend(group_id: Uin, user_id: Uin, comment?: string): Promise<RetCommon>;
    deleteFriend(user_id: Uin, block?: boolean): Promise<RetCommon>;
    inviteFriend(group_id: Uin, user_id: Uin): Promise<RetCommon>;
    sendLike(user_id: Uin, times?: number): Promise<RetCommon>;
    setNickname(nickname: string): Promise<RetCommon>;
    setGender(gender: 0 | 1 | 2): Promise<RetCommon>; //0未知 1男 2女
    setBirthday(birthday: string | number): Promise<RetCommon>; //20110202的形式
    setDescription(description?: string): Promise<RetCommon>;
    setSignature(signature?: string): Promise<RetCommon>;
    setPortrait(file: Buffer | string): Promise<RetCommon>; //图片CQ码中file相同格式
    setGroupPortrait(group_id: Uin, file: Buffer | string): Promise<RetCommon>;

    getCookies(domain?: string): Promise<RetCommon>;
    getCsrfToken(): Promise<RetCommon>;
    cleanCache(type?: string): Promise<RetCommon>; //type: "image" or "record" or undefined
    canSendImage(): RetCommon;
    canSendRecord(): RetCommon;
    getVersionInfo(): RetCommon; //暂时为返回package.json中的信息
    getStatus(): RetStatus;
    getLoginInfo(): RetLoginInfo;

    once(event: "system" | "request" | "message" | "notice", listener: (data: EventData) => void): this;
    on(event: "system" | "request" | "message" | "notice", listener: (data: EventData) => void): this;
    off(event: "system" | "request" | "message" | "notice", listener: (data: EventData) => void): this;
    once(event: string, listener: (data: EventData) => void): this;
    on(event: string, listener: (data: EventData) => void): this;
    off(event: string, listener: (data: EventData) => void): this;

    //重载完成之前bot不接受其他任何请求，也不会上报任何事件
    reloadFriendList(): Promise<RetCommon>; 
    reloadGroupList(): Promise<RetCommon>;
}

export function createClient(uin: Uin, config?: ConfBot): Client;
