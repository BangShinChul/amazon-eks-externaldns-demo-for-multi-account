# 프로젝트 소개
해당 프로젝트는 [Blue/Green 전략](./WHAT-IS-BLUE-GREEN-KR.md)을 활용하여 안전하게 클러스터를 업그레이드 할 수 있는 방법과 인사이트를 전달하는 것이 목적입니다.

해당 프로젝트에서는 AWS 멀티 어카운트 사이에서 ExternalDNS 애드온을 활용해 두 EKS 클러스터 간 가중치 기반 라우팅을 구성하는 방법과 Velero 애드온을 활용하여 EKS 클러스터 오브젝트 및 스토리지를 백업하고 복원할 수 있는 방법을 안내합니다.

실습 가이드 문서는 [여기](https://www.notion.so/bscnote/EKS-Upgrade-4532afde3f9349e19208e6dbb874eb38?pvs=4)를 참고합니다.

### 0. Pre-Requisites
- **네임서버 설정이 가능한** 본인 소유의 도메인이 필요합니다.
- [AWS Account](https://aws.amazon.com/resources/create-account/)
  - AWS 계정을 생성하고 [AdministratorAccess 권한](https://docs.aws.amazon.com/IAM/latest/UserGuide/getting-set-up.html#create-an-admin)을 해당 계정의 유저에 설정해주세요. 
  - 해당 유저의 권한은 데모에 필요한 VPC, EKS, ALB 와 같은 AWS 리소스를 프로비저닝 하기 위해 필요합니다.
- [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)
  - AWS CLI를 설치하고, 데모를 수행할 PC에 [aws credentials 정보를 설정](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-files.html#cli-configure-files-format)합니다.
- [AWS CDK](https://docs.aws.amazon.com/cdk/v2/guide/getting_started.html#getting_started_install)
- [npm](https://nodejs.org/ko/download)
- [kubectl](https://kubernetes.io/docs/tasks/tools/#kubectl)
- [git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)

### 실습

아래 명령과 같이 환경변수를 정의합니다.
```bash
export CDK_HOSTED_ZONE_NAME=<본인 소유의 실습용 도메인>

# ex) export CDK_HOSTED_ZONE_NAME=peccy.com
```

```bash
export CDK_PARENT_DNS_ACCOUNT_ID=<계정 A의 ID>

# ex) export CDK_PARENT_DNS_ACCOUNT_ID=111122223333
```


그 다음, 아래 명령을 순차적으로 실행하여 인프라를 프로비저닝 합니다.
```bash
cd aws-cdks/my-eks-blueprints/
npm install
cdk bootstrap
cdk synth
cdk deploy --all
```