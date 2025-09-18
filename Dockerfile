FROM alpine

RUN apk add --no-cache jq

COPY dist /tmp/build

RUN COMMIT_ID=$(jq -r .commit /tmp/build/component.json) \
&& WEB_PATH="/opt/zextras/web/iris/carbonio-calendars-ui/${COMMIT_ID}" \
&& mkdir -p "${WEB_PATH}" \
&& cp -r /tmp/build/* "${WEB_PATH}" \
&& rm -r /tmp/build

ENTRYPOINT ["/bin/sh", "-c", "jq -s '{components: .}' $(find /opt/zextras/web/iris/ -name component.json) > /opt/zextras/web/iris/components.json"]