<template>
	<scroll-view class="container" scroll-y>
		<view class="inner-wrapper">
			<view class="notice">
				<text>所有输入框均为选填项，填写越少结果越少，推荐精准输入避免生成过多密码</text>
			</view>

			<!-- 输入区 -->
			<view class="form-section" v-for="item in fields" :key="item.id">
				<text class="label">{{ item.label }}</text>
				<input :type="item.type || 'text'" v-model="form[item.id]" :placeholder="item.placeholder" class="input" />
			</view>

			<!-- 控制选项 -->
			<view class="form-section">
				<text class="label">连接符</text>
				<input class="input" v-model="form.connector" placeholder="如 _ . - @" />
				<view class="switches">
					<label>
						<checkbox value="connector_left" :checked="form.connector_left" @change="onCheckboxChange($event, 'connector_left')" />
						左
					</label>
					<label>
						<checkbox value="connector_middle" :checked="form.connector_middle" @change="onCheckboxChange($event, 'connector_middle')" />
						中
					</label>
					<label>
						<checkbox value="connector_right" :checked="form.connector_right" @change="onCheckboxChange($event, 'connector_right')" />
						右
					</label>
				</view>
			</view>

			<view class="form-section">
				<text class="label">常用词组</text>
				<input class="input" v-model="form.common" placeholder="如 123,abc,qwe" />
			</view>

			<view class="form-section">
				<label>
					<checkbox value="have_year" :checked="form.have_year" @change="onCheckboxChange($event, 'have_year')" />
					包含近几年年份
				</label>
				<input class="input" type="number" v-model="form.year" placeholder="近几年个数" />
			</view>

			<view class="form-section">
				<label>
					<checkbox value="number_filter" :checked="form.number_filter" @change="onCheckboxChange($event, 'number_filter')" />
					去除纯数字
				</label>
				<label>
					<checkbox value="string_filter" :checked="form.string_filter" @change="onCheckboxChange($event, 'string_filter')" />
					去除纯字母
				</label>
			</view>

			<view class="form-section">
				<text class="label">长度限制</text>
				<input class="input" type="number" v-model="form.short" placeholder="最短" />
				<input class="input" type="number" v-model="form.long" placeholder="最长" />
			</view>

			<view class="form-section">
				<label>
					<checkbox value="capitalize" :checked="form.capitalize" @change="onCheckboxChange($event, 'capitalize')" />
					首字母大写
				</label>
				<label>
					<checkbox value="lowercase" :checked="form.lowercase" @change="onCheckboxChange($event, 'lowercase')" />
					全小写
				</label>
				<label>
					<checkbox value="uppercase" :checked="form.uppercase" @change="onCheckboxChange($event, 'uppercase')" />
					全大写
				</label>
			</view>

			<!-- 按钮区 -->
			<view class="buttons">
				<button @click="generate">生成</button>
				<button @click="reset">重置</button>
				<button @click="copyAllResults">批量复制</button>
			</view>

			<!-- 输出区 -->
			<view v-if="result.length" class="result-section">
				<text>共生成 {{ result.length }} 条密码</text>
				<view v-for="(item, index) in result" :key="index" class="result-item">
					{{ item }}
				</view>
			</view>
		</view>
	</scroll-view>
</template>

<script>
import { getUpper, getLower, getCapitalize, getRepeat, getHeadTail, getDistinctList, dropShortLong, dropStringInt, calcDescartes, permutations } from '@/utils/passwordUtil.js';

export default {
	data() {
		return {
			fields: [
				{ id: 'first_name', label: '姓', placeholder: '请输入姓(英文)' },
				{ id: 'second_name', label: '名1', placeholder: '请输入名的第一个字(英文)' },
				{ id: 'third_name', label: '名2', placeholder: '请输入名的第二个字(英文)' },
				{ id: 'birthday', label: '生日', placeholder: '如 19900101' },
				{ id: 'birthday2', label: '农历生日', placeholder: '可选' },
				{ id: 'email', label: '邮箱', placeholder: '如 abc@123.com' },
				{ id: 'mobile', label: '手机号', placeholder: '如 13800138000' },
				{ id: 'telephone', label: '座机号', placeholder: '如 01088888888' },
				{ id: 'username', label: '用户名', placeholder: '如 admin' },
				{ id: 'account', label: '账号', placeholder: '如 user01' },
				{ id: 'organization', label: '组织', placeholder: '公司/组织名' },
				{ id: 'company', label: '公司', placeholder: '如 Baidu, Tencent' },
				{ id: 'like_use', label: '短语', placeholder: '如 iloveyou, abc 等' },
				{ id: 'id_card', label: '身份证号', placeholder: '18位身份证号' },
				{ id: 'work_no', label: '工号', placeholder: '如 10001' }
			],
			form: {
				first_name: '',
				second_name: '',
				third_name: '',
				birthday: '',
				birthday2: '',
				email: '',
				mobile: '',
				telephone: '',
				username: '',
				account: '',
				organization: '',
				company: '',
				like_use: '',
				id_card: '',
				work_no: '',
				connector: '@.-_',
				connector_left: true,
				connector_middle: true,
				connector_right: true,
				common: '123,888,666,000,111,aaa,abc,qaz,qwe,asd,zxc,!@#,1234,1qaz,qwer,asdf,zxcv,!@#$,1357,2468,0123,6789,6666,8888,12345,123456',
				have_year: true,
				year: 10,
				number_filter: false,
				string_filter: false,
				short: 6,
				long: 16,
				capitalize: true,
				lowercase: false,
				uppercase: false
			},
			result: []
		};
	},
	methods: {
		reset() {
			Object.keys(this.form).forEach((k) => {
				if (typeof this.form[k] === 'boolean') {
					this.form[k] = false;
				} else if (typeof this.form[k] === 'number') {
					this.form[k] = 0;
				} else {
					this.form[k] = '';
				}
			});
			this.result = [];
		},
		generate() {
			const f = this.form;
			const nameCombo = getDistinctList([f.first_name + f.second_name + f.third_name, f.second_name + f.third_name + f.first_name]);

			const birthdayList = getDistinctList([...getHeadTail(f.birthday, 4, 6), ...getHeadTail(f.birthday2, 4, 6)]);

			const emailPrefix = f.email.split('@')[0] || '';
			const emailList = getDistinctList(getHeadTail(emailPrefix, 3, 4));

			const phoneList = getDistinctList([...getHeadTail(f.mobile, 3, 4), ...getHeadTail(f.telephone, 3, 4)]);

			const orgList = getDistinctList(getHeadTail(f.organization, 3, 4).concat(getHeadTail(f.company, 3, 4)));
			const likeList = getDistinctList(f.like_use.split(',').map((s) => s.trim()));
			const commonList = f.common.split(',');
			const yearList = f.have_year ? Array.from({ length: f.year }, (_, i) => (new Date().getFullYear() - i).toString()) : [];

			const base = getDistinctList([...nameCombo, ...birthdayList, ...emailList, ...phoneList, ...orgList, ...likeList, ...commonList, ...yearList]);

			let result = [...base];

			permutations([nameCombo, birthdayList, emailList], 2).forEach((group) => {
				const desc = calcDescartes(group);
				result.push(...desc.map((p) => p.join('')));
				f.connector.split('').forEach((c) => {
					desc.forEach((p) => {
						if (f.connector_middle) result.push(`${p[0]}${c}${p[1]}`);
						if (f.connector_left) result.push(`${c}${p[0]}${p[1]}`);
						if (f.connector_right) result.push(`${p[0]}${p[1]}${c}`);
					});
				});
			});

			result = dropShortLong(result, f.short, f.long);
			if (f.number_filter) result = dropStringInt(result, 'int');
			if (f.string_filter) result = dropStringInt(result, 'str');
			if (f.capitalize) result = getCapitalize(result);
			if (f.lowercase) result = getLower(result);
			if (f.uppercase) result = getUpper(result);
			this.result = getDistinctList(result);
		},
		onCheckboxChange(event, key) {
			this.$set(this.form, key, event.detail.value);
		},
		copyToClipboard(text) {
			uni.setClipboardData({
				data: text,
				success: () => {
					console.log('Copied to clipboard');
				},
				fail: (err) => {
					console.error('Failed to copy text: ', err);
				}
			});
		},
		copyAllResults() {
			if (this.result.length === 0) {
				console.log('No results to copy');
				return;
			}
			const allResults = this.result.join('\n');
			uni.setClipboardData({
				data: allResults,
				success: () => {
					console.log('All results copied to clipboard');
				},
				fail: (err) => {
					console.error('Failed to copy all results: ', err);
				}
			});
		}
	}
};
</script>

<style scoped>
.container {
	padding: 0;
}
.inner-wrapper {
	padding: 30rpx;
}
.notice {
	background: #e6f7ff;
	color: #333;
	padding: 20rpx;
	margin-bottom: 20rpx;
	border-radius: 10rpx;
}
.label {
	font-size: 28rpx;
	font-weight: bold;
}
.input {
	border: 1px solid #ccc;
	padding: 16rpx;
	border-radius: 10rpx;
	margin: 10rpx 0 20rpx;
}
.form-section {
	margin-bottom: 20rpx;
}
.switches {
	display: flex;
	gap: 20rpx;
	margin-top: 10rpx;
	flex-wrap: wrap;
}
.buttons {
	display: flex;
	justify-content: space-around;
	margin-top: 20rpx;
}
button {
	background-color: #007aff;
	color: white;
	padding: 20rpx;
	border-radius: 10rpx;
	flex: 1;
	margin: 0 10rpx;
}
.result-section {
	margin-top: 40rpx;
	padding: 20rpx;
	background: #f5f5f5;
	border-radius: 10rpx;
}
.result-item {
	font-size: 26rpx;
	padding: 8rpx 0;
	border-bottom: 1rpx solid #ddd;
}
</style>
