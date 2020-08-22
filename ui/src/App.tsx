import React, { useState } from "react";
import { Input, Button, Typography, Alert, Spin, Switch, List } from "antd";
import styled from "styled-components";
import { Form, Field } from "react-final-form";
import { downloadSingleVideo } from "./lib/api";

const Container = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  height: 100vh;
  @media (max-width: 850px) and (min-width: 1px) {
    grid-template-columns: 1fr;
  }
`;

const FormWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: min-content min-content 1fr;
  grid-column: 2 / 2;
  @media (max-width: 850px) and (min-width: 1px) {
    grid-column: 1 / 1;
  }
`;

const Wrapper = styled.div`
  max-height: 200px;
  margin-bottom: 10px;
`;

const Title = styled(Typography.Title)`
  text-align: center;
  height: min-content;
`;

const HTMLFormWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr min-content;
`;

const DirectDownloadWrapper = styled.div`
  display: flex;
  padding-top: 10px;
  p {
    padding-right: 10px;
  }
`;

const MediaWrapper = styled.div`
  position: relative;
  width: 100%;
  video {
    position: relative;
    width: 100%;
  }
  img {
    position: relative;
    width: 100%;
  }
`;

type Content = {
  url: any;
  fileName: string;
  type: "video" | "image" | null;
}

const App = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [error, setError] = useState<{ show: boolean; message: string }>({ show: false, message: "" });
  const [direct, setDirect] = useState<boolean>(false);
  const [content, setContent] = useState<Content[]>([]);
  const [playing, setPlaying] = useState<{ url: string; fileName: string; type: string | null; open: boolean }>({ url: "", fileName: "", type: null, open: false });

  const handleSubmit = async (fields: any) => {
    setLoading(true);
    setError({ message: "", show: false });
    setContent([]);
    setSuccess(false);
    setPlaying({ ...playing, open: false });
    try {
      const result = await downloadSingleVideo(fields.url, direct);
      setContent(result);
      setSuccess(true);
      setLoading(false);
      setError({ message: "", show: false });
    } catch (error) {
      setError({ message: error, show: true });
      setLoading(false);
    }
  };

  const openMedia = (media: Content) => {
    setPlaying({ ...media, open: true });
  };

  return (
    <Container>
      <FormWrapper>
        <Wrapper>
          <Title level={2}>Instagram & Tiktok Downloader</Title>
          <Form
            onSubmit={handleSubmit}
            render={({ handleSubmit }) => (
              <Spin spinning={loading}>
                <form onSubmit={handleSubmit}>
                  <HTMLFormWrapper>
                    <Field
                      name="url"
                      render={({ input }) => (
                        <Input {...input} autoComplete="off" placeholder="Enter a URL" />
                      )}
                    />
                    <Button type="primary" htmlType="submit">Submit</Button>
                  </HTMLFormWrapper>
                </form>
                <DirectDownloadWrapper>
                  <p>Direct download:</p>
                  <Switch checked={direct} onChange={() => setDirect(!direct)} title="Direct download" />
                </DirectDownloadWrapper>
              </Spin>
            )}
          />
          {success && direct && (
            <Alert
              message="Successfully downloaded file."
              type="success"
              closable
              onClose={() => setSuccess(false)}
              style={{ marginTop: "10px" }}
              showIcon
            />
          )}
          {error.show && (
            <Alert
              message={error.message}
              type="error"
              closable
              onClose={() => setError({ message: "", show: false })}
              style={{ marginTop: "10px" }}
              showIcon
            />
          )}
        </Wrapper>
        <div>
          {content.map((item, key) => (
            <List.Item
              key={key}
              actions={[<a href={item.url} download={item.fileName}>Download</a>]}
            >
              <Typography>
                <a href="#" onClick={() => openMedia(item)}>{item.fileName}</a>
              </Typography>
            </List.Item>
          ))}
        </div>
        <MediaWrapper>
          {playing.open && playing.type === "video" ? (
            <video src={playing.url} controls />
          ) : (
              <img src={playing.url} />
            )}
        </MediaWrapper>
      </FormWrapper>
    </Container>
  );
}

export default App;
