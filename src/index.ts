import { Context, Schema, Logger, Time, $, h } from 'koishi'
import got from 'got'
export const name = 'qubic'
export const using = ['console', 'database']
export interface Config { }

export const Config: Schema<Config> = Schema.object({})

export function apply(ctx: Context) {
  async function createWalletId(ctx, targetId: string, walletId: string) {
    await ctx.database.create('qubic', { targetId: targetId, walletId: walletId });
  }
  async function getWalletId(ctx, targetId: string) {
    const targetInfo = await ctx.database.get('qubic', { targetId: targetId });
    return targetInfo[0].walletId;
  }
  async function getMiningInfo(ctx: Context, walletId: string) {
    let url = `https://pooltemp.qubic.solutions/info?miner=${walletId}&list=true`;
    let res = await got(url);
    let data = JSON.parse(res.body);
    let msg = '';
    if (data.devices) {
      msg += `当前算力：${data.iterrate.toFixed(2)}\n`;
      msg += `当前设备：${data.devices}\n`;
      msg += `当前出块：${data.solutions}\n`;
    }
    return msg;
  }
  ctx.on('message', async (session) => {
    if (session.content === 'qubic') {
      session.send(await getMiningInfo(ctx, await getWalletId(ctx, session.userId)))
      return
    }
    ctx.command('qubic [arg:string]')
      .action(({ session }, arg) => {
        createWalletId(ctx, session.userId, arg)
        session.send(`已设置钱包ID为${arg}`)
      })
  })
}
